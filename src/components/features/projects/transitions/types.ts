// src/components/features/projects/transitions/types.ts
import { ProjectStatus } from "@/generated/prisma/client";
import type { ProjectWithDetails } from "@/repositories/IProjectsRepository";

export interface TransitionStrategyProps {
  project: ProjectWithDetails;
  targetStatus: ProjectStatus;
  onSuccess: () => void;
  onCancel: () => void;
  // Dados auxiliares opcionais (ex: lista de serviços carregada previamente)
  contextData?: any; 
}