// src/components/features/projects/transitions/transitionRegistry.ts
import { ProjectStatus } from "@/generated/prisma/browser";
import { ToTechAnalysis } from "./strategies/ToTechAnalysis";
import { ToProposal } from "./strategies/ToProposal";
import { ToProposalGenerated } from "./strategies/ToProposalGenerated";
import { DefaultTransitionForm } from "./strategies/DefaultTransitionForm";

// Mapeia STATUS_ALVO -> Componente
export const TRANSITION_STRATEGIES: Partial<
  Record<ProjectStatus, React.ComponentType<any>>
> = {
  [ProjectStatus.TECH_ANALYSIS]: ToTechAnalysis,
  [ProjectStatus.PROPOSAL]: ToProposal,
  [ProjectStatus.PROPOSAL_GENERATED]: ToProposalGenerated,
  // ... adicione os outros conforme criar
};

export const getTransitionStrategy = (status: ProjectStatus) => {
  return TRANSITION_STRATEGIES[status] || DefaultTransitionForm;
};
