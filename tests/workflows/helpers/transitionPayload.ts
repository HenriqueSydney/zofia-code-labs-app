import type { ProjectStatus } from "@/generated/prisma/client";
import type { ProjectWorkflowContext } from "./setupProjectWorkflow";

/**
 * Payload para testes que esperam `BusinessRuleError` no guard de transição.
 *
 * O use case valida `validateProjectTransition` **antes** dos handlers (`handleToTechAnalysis`,
 * `handleToProposal`). Mesmo assim, quando `newStatus` é PROPOSAL ou TECH_ANALYSIS, preenchemos
 * dados mínimos para que, se o guard passar por engano, a falha não seja `ValidationError`
 * de escopo — mascarando o que o teste pretende verificar.
 */
export function payloadWhenTestingStatusGuard(
  from: ProjectStatus,
  to: ProjectStatus,
  ctx: ProjectWorkflowContext,
): Record<string, unknown> {
  if (to === "TECH_ANALYSIS") {
    return { isRegress: true };
  }

  if (
    to === "PROPOSAL" &&
    (from === "DRAFT" || from === "TECH_ANALYSIS")
  ) {
    return { serviceIds: [ctx.serviceTypeId] };
  }

  return { observation: "Tentativa de transição bloqueada pelo guard." };
}

export function cancelProjectPayload(
  from: ProjectStatus,
): Record<string, unknown> {
  return { observation: `Cancelamento do projeto a partir de ${from}.` };
}
