import { BacklogPriority, BacklogStatus } from "@/generated/prisma/enums";

export const backlogPriorityMapper: Record<BacklogPriority, string> = {
  URGENT: "Urgente",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
} as const;

export const backlogStatusMapper: Record<BacklogStatus, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Andamento",
  REVIEW: "Revisão",
  DONE: "Concluído",
  CANCELED: "Cancelado",
  WAITING_CLIENT: "Aguardando Cliente",
} as const;

export const backlogStatusArray = Object.keys(backlogStatusMapper) as [
  BacklogStatus,
  ...BacklogStatus[],
];
export const backlogPriorityArray = Object.keys(backlogPriorityMapper) as [
  BacklogPriority,
  ...BacklogPriority[],
];
