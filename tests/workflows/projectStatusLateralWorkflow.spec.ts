import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROJECT_STATUS_FLOW } from "@/domain/project/ProjectWorkflow";
import { BusinessRuleError } from "@/errors/BusinessRuleError";
import { ValidationError } from "@/errors/ValidationError";
import type { ProjectStatus } from "@/generated/prisma/client";
import {
  asGetTranslationsMock,
  createMockServerTranslator,
  mockGetTranslationsImpl,
} from "../helpers/mockNextIntlServer";
import {
  cancelProjectPayload,
  payloadWhenTestingStatusGuard,
} from "./helpers/transitionPayload";
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

const CANCELLABLE_STATUSES = PROJECT_STATUS_FLOW.filter(
  (status) => !["COMPLETED", "MAINTENANCE"].includes(status),
);

const TERMINAL_STATUSES: ProjectStatus[] = ["COMPLETED", "MAINTENANCE"];

describe("Project status workflow — estados laterais", () => {
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

  it.each(CANCELLABLE_STATUSES)(
    "deve cancelar a partir de $from e bloquear qualquer nova transição",
    async (from) => {
      setProjectStatus(ctx, from);

      const cancelled = await ctx.sut.execute({
        projectId: ctx.projectId,
        newStatus: "CANCELLED",
        userId: ctx.userId,
        data: cancelProjectPayload(from),
      });

      expect(cancelled.status).toBe("CANCELLED");

      await expect(() =>
        ctx.sut.execute({
          projectId: ctx.projectId,
          newStatus: "TECH_ANALYSIS",
          userId: ctx.userId,
          data: payloadWhenTestingStatusGuard("CANCELLED", "TECH_ANALYSIS", ctx),
        }),
      ).rejects.toBeInstanceOf(BusinessRuleError);

      expect(ctx.projectsRepository.items[0]?.status).toBe("CANCELLED");
    },
  );

  it.each(TERMINAL_STATUSES)(
    "não deve permitir cancelar projeto em status terminal (%s)",
    async (from) => {
      setProjectStatus(ctx, from);

      await expect(() =>
        ctx.sut.execute({
          projectId: ctx.projectId,
          newStatus: "CANCELLED",
          userId: ctx.userId,
          data: cancelProjectPayload(from),
        }),
      ).rejects.toBeInstanceOf(BusinessRuleError);
    },
  );

  it("deve rejeitar transição linear em projeto já cancelado", async () => {
    setProjectStatus(ctx, "CANCELLED");

    await expect(() =>
      ctx.sut.execute({
        projectId: ctx.projectId,
        newStatus: "DRAFT",
        userId: ctx.userId,
        data: payloadWhenTestingStatusGuard("CANCELLED", "DRAFT", ctx),
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("deve falhar no guard antes da validação de serviços (DRAFT → PROPOSAL com payload vazio)", async () => {
    setProjectStatus(ctx, "DRAFT");

    await expect(
      ctx.sut.execute({
        projectId: ctx.projectId,
        newStatus: "PROPOSAL",
        userId: ctx.userId,
        data: {},
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof BusinessRuleError && !(error instanceof ValidationError),
    );
  });

  it("não deve permitir ON_HOLD a partir de status terminal (COMPLETED)", async () => {
    setProjectStatus(ctx, "COMPLETED");

    await expect(() =>
      ctx.sut.execute({
        projectId: ctx.projectId,
        newStatus: "ON_HOLD",
        userId: ctx.userId,
        data: { observation: "Tentativa inválida" },
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("deve permitir ON_HOLD a partir de fase intermediária", async () => {
    setProjectStatus(ctx, "PROPOSAL");

    const paused = await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "ON_HOLD",
      userId: ctx.userId,
      data: { observation: "Pausa comercial" },
    });

    expect(paused.status).toBe("ON_HOLD");
  });

  it("deve permitir retomar de ON_HOLD para o status anterior no fluxo", async () => {
    setProjectStatus(ctx, "PROPOSAL");

    await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "ON_HOLD",
      userId: ctx.userId,
      data: { observation: "Pausa comercial temporária" },
    });

    const resumed = await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "PROPOSAL",
      userId: ctx.userId,
      data: { observation: "Retomada após pausa" },
    });

    expect(resumed.status).toBe("PROPOSAL");
    expect(
      ctx.auditLogRepository.items.filter((log) => log.action === "STATUS_CHANGE"),
    ).toHaveLength(2);
  });

  it("deve permitir retomar de ON_HOLD para outro status válido do fluxo (ex.: PLANNED)", async () => {
    setProjectStatus(ctx, "IN_PROGRESS");

    await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "ON_HOLD",
      userId: ctx.userId,
      data: { observation: "Pausa operacional" },
    });

    const resumed = await ctx.sut.execute({
      projectId: ctx.projectId,
      newStatus: "PLANNED",
      userId: ctx.userId,
      data: { observation: "Retomada direto no planejamento" },
    });

    expect(resumed.status).toBe("PLANNED");
  });
});
