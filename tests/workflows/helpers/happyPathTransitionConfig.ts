import { PROJECT_STATUS_FLOW } from "@/domain/project/ProjectWorkflow";
import type { ProjectStatus } from "@/generated/prisma/client";
import type { ProjectWorkflowContext } from "./setupProjectWorkflow";

/** Tupla readonly para inferir apenas transições adjacentes do fluxo linear. */
const LINEAR_PROJECT_STATUS_FLOW = [...PROJECT_STATUS_FLOW] as const;

/** Apenas pares consecutivos em `PROJECT_STATUS_FLOW` (caminho feliz linear). */
type AdjacentInFlow<T extends readonly ProjectStatus[]> = T extends readonly [
  infer From extends ProjectStatus,
  infer To extends ProjectStatus,
  ...infer Rest extends ProjectStatus[],
]
  ? `${From}->${To}` | AdjacentInFlow<readonly [To, ...Rest]>
  : never;

export type HappyPathTransitionKey =
  AdjacentInFlow<typeof LINEAR_PROJECT_STATUS_FLOW>;

export function happyPathTransitionKey(
  from: ProjectStatus,
  to: ProjectStatus,
): HappyPathTransitionKey {
  return `${from}->${to}` as HappyPathTransitionKey;
}

/** Payloads alinhados aos formulários de transição (ToTechAnalysis, ToProposal, DefaultTransitionForm). */
export function happyPathTransitionPayload(
  from: ProjectStatus,
  to: ProjectStatus,
  ctx: ProjectWorkflowContext,
): Record<string, unknown> {
  if (from === "DRAFT" && to === "TECH_ANALYSIS") {
    return {
      observation: "Escopo inicial enviado para análise de viabilidade.",
      serviceIds: [ctx.serviceTypeId],
    };
  }

  if (from === "TECH_ANALYSIS" && to === "PROPOSAL") {
    return {
      observation: "Análise concluída; incluir consultoria no escopo da proposta.",
      serviceIds: [ctx.serviceTypeId, ctx.additionalServiceTypeId],
    };
  }

  return {
    observation: `Avanço de ${from} para ${to}.`,
  };
}
