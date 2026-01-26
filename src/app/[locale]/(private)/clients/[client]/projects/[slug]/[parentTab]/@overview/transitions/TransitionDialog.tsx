import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTransitionStrategy } from "./transitionRegistry";
import { ProjectStatus } from "@/generated/prisma/browser";
import type { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import {
  getContractNextStepLabel,
  getProposalNextStepLabel,
} from "@/utils/getNextStageLabel";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetStatus: ProjectStatus;
  project: ProjectWithDetails;
  currentStatusLabel: string;
  targetStatusLabel: string;
  contextData?: any; // Dados como lista de serviços, etc.
}

export function ProjectTransitionDialog({
  isOpen,
  onOpenChange,
  targetStatus,
  project,
  targetStatusLabel,
  contextData,
}: Props) {
  // 1. Descobre qual estratégia usar baseada no destino
  const StrategyComponent = getTransitionStrategy(targetStatus);
  if (!StrategyComponent) {
    // Retorna null ou um modal genérico de "Tem certeza?"
    return null;
  }

  switch (targetStatus) {
    case "PROPOSAL_GENERATED":
      targetStatusLabel = getProposalNextStepLabel(project.proposal);
      break;
    case "WAITING_SIGNATURE":
      targetStatusLabel = getContractNextStepLabel(project.contract);
      break;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[800px] md:max-w-[1200px] max-h-[90vh] flex flex-col pr-0"
        aria-describedby="Formulário de avanço de etapa"
      >
        <DialogHeader>
          <DialogTitle>Avançar para: {targetStatusLabel}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <StrategyComponent
            project={project}
            targetStatus={targetStatus}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            contextData={contextData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
