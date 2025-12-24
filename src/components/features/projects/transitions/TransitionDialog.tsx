import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTransitionStrategy } from "./transitionRegistry";
import { ProjectStatus } from "@/generated/prisma/browser";
import type { ProjectWithDetails } from "@/repositories/IProjectsRepository";

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[800px] md:max-w-[1200px] "
        aria-describedby="Formulário de avanço de etapa"
      >
        <DialogHeader>
          <DialogTitle>Avançar para: {targetStatusLabel}</DialogTitle>
        </DialogHeader>

        <StrategyComponent
          project={project}
          targetStatus={targetStatus}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          contextData={contextData}
        />
      </DialogContent>
    </Dialog>
  );
}
