import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PROJECT_STATUS_FLOW,
  validateProjectTransition,
} from "@/domain/project/ProjectWorkflow";
import { BusinessRuleError } from "@/errors/BusinessRuleError";
import type { ProjectStatus } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  asGetTranslationsMock,
  createMockServerTranslator,
  mockGetTranslationsImpl,
} from "../helpers/mockNextIntlServer";
import { assertHappyPathStepEffects } from "./helpers/assertHappyPathStep";
import { happyPathTransitionPayload } from "./helpers/happyPathTransitionConfig";
import { payloadWhenTestingStatusGuard } from "./helpers/transitionPayload";
import {
  createProjectWorkflowContext,
  seedDraftProject,
  setProjectStatus,
  type ProjectWorkflowContext,
} from "./helpers/setupProjectWorkflow";

vi.mock("@/lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback({})),
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => Promise.resolve(createMockServerTranslator())),
}));

vi.mock("@/mappers/projectStageMapper", () => ({
  findTranslatedStage: vi.fn((status: string) => ({
    label: status,
    shortLabel: status,
    description: "",
    key: status,
    icon: () => null,
    color: "",
  })),
}));

vi.mock("@/email/send", () => ({
  sendDevStartEmail: vi.fn().mockResolvedValue(undefined),
  sendHomologationReadyEmail: vi.fn().mockResolvedValue(undefined),
  sendProjectHandover: vi.fn().mockResolvedValue(undefined),
}));

/** Pares do fluxo linear rejeitados por `validateProjectTransition` (fonte única de regras). */
function disallowedTransitionsInLinearFlow(): Array<{
  from: ProjectStatus;
  to: ProjectStatus;
}> {
  const pairs: Array<{ from: ProjectStatus; to: ProjectStatus }> = [];

  for (const from of PROJECT_STATUS_FLOW) {
    for (const to of PROJECT_STATUS_FLOW) {
      if (from === to) continue;
      if (!validateProjectTransition(from, to)) {
        pairs.push({ from, to });
      }
    }
  }

  return pairs;
}

const DISALLOWED_LINEAR_TRANSITIONS = disallowedTransitionsInLinearFlow();

describe("Project status workflow", () => {
  let ctx: ProjectWorkflowContext;

  beforeEach(async () => {
    vi.clearAllMocks();
    ctx = createProjectWorkflowContext();
    await seedDraftProject(ctx);

    const { getTranslations } = await import("next-intl/server");
    vi.mocked(getTranslations).mockImplementation(
      asGetTranslationsMock(mockGetTranslationsImpl),
    );
  });

  it("deve percorrer o caminho feliz de DRAFT até MAINTENANCE, validando efeitos de cada etapa", async () => {
    let currentStatus: ProjectStatus = "DRAFT";

    for (let i = 0; i < PROJECT_STATUS_FLOW.length - 1; i++) {
      const nextStatus = PROJECT_STATUS_FLOW[i + 1]!;
      const data = happyPathTransitionPayload(currentStatus, nextStatus, ctx);

      const updated = await ctx.sut.execute({
        projectId: ctx.projectId,
        newStatus: nextStatus,
        userId: ctx.userId,
        data,
      });

      assertHappyPathStepEffects(ctx, currentStatus, nextStatus, updated, data);
      currentStatus = nextStatus;
    }

    expect(currentStatus).toBe("MAINTENANCE");
    expect(ctx.auditLogRepository.items).toHaveLength(
      PROJECT_STATUS_FLOW.length - 1,
    );
    expect(vi.mocked(checkUserPermissionForAsset)).toHaveBeenCalledTimes(
      PROJECT_STATUS_FLOW.length - 1,
    );
  });

  it.each(DISALLOWED_LINEAR_TRANSITIONS)(
    "não deve permitir transição inválida no use case ($from → $to)",
    async ({ from, to }) => {
      setProjectStatus(ctx, from);

      await expect(() =>
        ctx.sut.execute({
          projectId: ctx.projectId,
          newStatus: to,
          userId: ctx.userId,
          data: payloadWhenTestingStatusGuard(from, to, ctx),
        }),
      ).rejects.toBeInstanceOf(BusinessRuleError);
    },
  );

  it("deve permitir apenas avançar ou retroceder uma fase por vez no fluxo linear", async () => {
    setProjectStatus(ctx, "IN_PROGRESS");

    const updatedForward = await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "REVIEW",
      userId: ctx.userId,
      data: {},
    });
    expect(updatedForward.status).toBe("REVIEW");

    const updatedBackward = await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "IN_PROGRESS",
      userId: ctx.userId,
      data: {},
    });
    expect(updatedBackward.status).toBe("IN_PROGRESS");
  });

});
