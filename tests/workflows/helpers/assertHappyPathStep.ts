import { expect, vi } from "vitest";
import type { ProjectStatus } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import type { Project } from "@/generated/prisma/client";
import {
  happyPathTransitionKey,
  type HappyPathTransitionKey,
} from "./happyPathTransitionConfig";
import {
  getHappyPathServiceIds,
  type ProjectWorkflowContext,
} from "./setupProjectWorkflow";

export function getProjectServiceIds(ctx: ProjectWorkflowContext): string[] {
  return ctx.projectsRepository.projectServices
    .filter((link) => link.projectId === ctx.projectId)
    .map((link) => link.serviceTypeId);
}

function latestAudit(ctx: ProjectWorkflowContext) {
  const logs = ctx.auditLogRepository.items.filter(
    (log) => log.entityId === ctx.projectId,
  );
  return logs[logs.length - 1];
}

type StatusChangeAuditMetadata = {
  relatedNoteId?: string | null;
  observation?: string;
};

function getLatestAuditMetadata(
  ctx: ProjectWorkflowContext,
): StatusChangeAuditMetadata {
  const metadata = latestAudit(ctx)?.metadata;

  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as StatusChangeAuditMetadata;
  }

  return {};
}

function latestNote(ctx: ProjectWorkflowContext) {
  const notes = ctx.projectNotesRepository.items.filter(
    (note) => note.projectId === ctx.projectId,
  );
  return notes[notes.length - 1];
}

export function expectLatestAudit(
  ctx: ProjectWorkflowContext,
  expected: {
    from: ProjectStatus;
    to: ProjectStatus;
    data?: Record<string, unknown>;
  },
): void {
  const audit = latestAudit(ctx);

  expect(audit).toBeDefined();
  expect(audit?.action).toBe("STATUS_CHANGE");
  expect(audit?.entityType).toBe("Project");
  expect(audit?.userId).toBe(ctx.userId);
  expect(audit?.changes).toEqual({
    status: { from: expected.from, to: expected.to },
  });

  if (expected.data?.observation) {
    expect(audit?.metadata).toMatchObject({
      observation: expect.stringContaining(String(expected.data.observation)),
    });
  }
}

export function expectLatestNote(
  ctx: ProjectWorkflowContext,
  expected: {
    mustContain?: string[];
    mustNotContain?: string[];
  },
): void {
  const note = latestNote(ctx);

  expect(note).toBeDefined();
  expect(note?.userId).toBe(ctx.userId);

  for (const fragment of expected.mustContain ?? []) {
    expect(note?.content).toContain(fragment);
  }

  for (const fragment of expected.mustNotContain ?? []) {
    expect(note?.content).not.toContain(fragment);
  }
}

export function assertHappyPathStepEffects(
  ctx: ProjectWorkflowContext,
  from: ProjectStatus,
  to: ProjectStatus,
  updated: Project,
  data: Record<string, unknown>,
): void {
  const key = happyPathTransitionKey(from, to);

  expect(updated.status).toBe(to);
  expect(vi.mocked(checkUserPermissionForAsset)).toHaveBeenCalledWith(
    "project",
    ctx.userId,
    expect.objectContaining({ id: ctx.projectId }),
    "UPDATE",
  );

  const assertions = {
    "DRAFT->TECH_ANALYSIS": () => {
      expect(getProjectServiceIds(ctx)).toEqual([ctx.serviceTypeId]);
      expectLatestAudit(ctx, { from, to, data });
      expectLatestNote(ctx, {
        mustContain: [
          `${from}->${to}`,
          String(data.observation),
        ],
        mustNotContain: [
          "Alteração de serviços",
          "Alterações no Escopo de Serviços",
        ],
      });
      expect(getLatestAuditMetadata(ctx).relatedNoteId).toBeTruthy();
    },
    "TECH_ANALYSIS->PROPOSAL": () => {
      expect(getProjectServiceIds(ctx)).toEqual(getHappyPathServiceIds(ctx));
      expectLatestAudit(ctx, { from, to, data });
      expectLatestNote(ctx, {
        mustContain: [
          `${from}->${to}`,
          String(data.observation),
          "Alteração de serviços",
          "Alterações no Escopo de Serviços",
          "Adicionados",
        ],
      });
    },
    "PROPOSAL->PROPOSAL_GENERATED": () => assertStandardAdvance(ctx, from, to, data),
    "PROPOSAL_GENERATED->WAITING_SIGNATURE": () =>
      assertStandardAdvance(ctx, from, to, data),
    "WAITING_SIGNATURE->WAITING_DOWN_PAYMENT": () =>
      assertStandardAdvance(ctx, from, to, data),
    "WAITING_DOWN_PAYMENT->PLANNED": () =>
      assertStandardAdvance(ctx, from, to, data),
    "PLANNED->IN_PROGRESS": () => assertStandardAdvance(ctx, from, to, data),
    "IN_PROGRESS->REVIEW": () => assertStandardAdvance(ctx, from, to, data),
    "REVIEW->DELIVERED": () => assertStandardAdvance(ctx, from, to, data),
    "DELIVERED->FINAL_PAYMENT": () => assertStandardAdvance(ctx, from, to, data),
    "FINAL_PAYMENT->COMPLETED": () => assertStandardAdvance(ctx, from, to, data),
    "COMPLETED->MAINTENANCE": () => assertStandardAdvance(ctx, from, to, data),
  } satisfies Record<HappyPathTransitionKey, () => void>;

  const assertStep = assertions[key as keyof typeof assertions];
  if (!assertStep) {
    throw new Error(`Sem asserções de caminho feliz para ${key}`);
  }

  assertStep();
}

function assertStandardAdvance(
  ctx: ProjectWorkflowContext,
  from: ProjectStatus,
  to: ProjectStatus,
  data: Record<string, unknown>,
): void {
  expect(getProjectServiceIds(ctx)).toEqual(getHappyPathServiceIds(ctx));
  expectLatestAudit(ctx, { from, to, data });
  expectLatestNote(ctx, {
    mustContain: [`${from}->${to}`, String(data.observation)],
    mustNotContain: ["Alteração de serviços", "Alterações no Escopo de Serviços"],
  });
}
