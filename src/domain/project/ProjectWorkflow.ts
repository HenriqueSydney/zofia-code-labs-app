// src/domain/project/ProjectWorkflow.ts
import { ProjectStatus } from "@/generated/prisma/client";

// Ordem cronológica do "Caminho Feliz"
export const PROJECT_STATUS_FLOW: ProjectStatus[] = [
  "DRAFT",
  "TECH_ANALYSIS",
  "PROPOSAL",
  "PROPOSAL_GENERATED",
  "WAITING_SIGNATURE",
  "WAITING_DOWN_PAYMENT",
  "PLANNED",
  "IN_PROGRESS",
  "REVIEW",
  // ON_HOLD e CANCELLED são estados "laterais", não necessariamente sequenciais
  "DELIVERED",
  "FINAL_PAYMENT",
  "COMPLETED",
  "MAINTENANCE",
];

export const validateProjectTransition = (
  currentStatus: ProjectStatus,
  newStatus: ProjectStatus
): boolean => {
  // 1. Permite ir para CANCELLED ou ON_HOLD de quase qualquer lugar (exceto se já finalizado)
  if (["CANCELLED", "ON_HOLD"].includes(newStatus)) {
    return !["COMPLETED", "MAINTENANCE"].includes(currentStatus);
  }

  // 2. Permite sair de ON_HOLD para o estado anterior (retomar)
  // (Aqui simplificamos: se estava ON_HOLD, permitimos voltar para DRAFT ou PLANNED,
  // mas idealmente você guardaria o estado anterior. Vamos focar no Advance/Regress linear).
  if (currentStatus === "ON_HOLD" && newStatus !== "ON_HOLD") {
    return true; // Assume que o usuário sabe para onde está retomando
  }

  const currentIndex = PROJECT_STATUS_FLOW.indexOf(currentStatus);
  const newIndex = PROJECT_STATUS_FLOW.indexOf(newStatus);

  // Se algum status não estiver no fluxo (erro de config), bloqueia
  if (currentIndex === -1 || newIndex === -1) return false;

  // 3. Regra de Ouro: Só pode mover 1 para frente ou 1 para trás
  const diff = newIndex - currentIndex;

  // diff === 1 (Avançar) | diff === -1 (Voltar)
  return Math.abs(diff) === 1;
};
