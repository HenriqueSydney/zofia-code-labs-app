"use client";

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
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetStatus: ProjectStatus;
  project: ProjectWithDetails;
  currentStatusLabel: string;
  targetStatusLabel: string;
  contextData?: any;
}

export function ProjectTransitionDialog({
  isOpen,
  onOpenChange,
  targetStatus,
  project,
  targetStatusLabel,
  contextData,
}: Props) {
  const t = useTranslations("projects.transitions");
  const tNextSteps = useTranslations("projects.transitions.nextSteps");
  const StrategyComponent = getTransitionStrategy(targetStatus);
  if (!StrategyComponent) {
    return null;
  }

  const translateNextStep = (key: string) =>
    tNextSteps(key as Parameters<typeof tNextSteps>[0]);

  let resolvedTargetLabel = targetStatusLabel;

  switch (targetStatus) {
    case "PROPOSAL_GENERATED":
      resolvedTargetLabel = getProposalNextStepLabel(
        project.proposal,
        translateNextStep,
      );
      break;
    case "WAITING_SIGNATURE":
      resolvedTargetLabel = getContractNextStepLabel(
        project.contract,
        translateNextStep,
      );
      break;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[800px] md:max-w-[1200px] max-h-[90vh] flex flex-col pr-0"
        aria-describedby={t("dialogDescription")}
      >
        <DialogHeader>
          <DialogTitle>
            {t("dialogTitle", { status: resolvedTargetLabel })}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isOpen && (
            <StrategyComponent
              project={project}
              targetStatus={targetStatus}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
              contextData={contextData}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
