"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Wrench, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/utils/twMerge";
import { FlowSection } from "./FlowSection";
import {
  allStages,
  cancelledStage,
  commercialClosingStages,
  commercialStages,
  operationalStages,
  translateStageConfig,
  translateStageConfigs,
  type TranslatedStageConfig,
} from "@/mappers/projectStageMapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { cancelProjectAction } from "@/actions/projects/cancelProject";
import { ProjectTransitionDialog } from "@/app/[locale]/(private)/clients/[client]/projects/[slug]/[parentTab]/@overview/transitions/TransitionDialog";

import {
  getContractNextStepLabel,
  getProposalNextStepLabel,
} from "@/utils/getNextStageLabel";
import { RegressDialog } from "@/app/[locale]/(private)/clients/[client]/projects/[slug]/[parentTab]/@overview/transitions/RegressDialog";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface ProjectTimelineProps {
  project: ProjectWithDetails;
  contextData?: unknown;
  canUpdate: boolean;
  canDelete: boolean;
  isOwner: boolean;
}

const ProjectTimeline = ({
  project,
  contextData,
  canUpdate,
  canDelete,
  isOwner,
}: ProjectTimelineProps) => {
  const t = useTranslations("projects.overview.timeline");
  const tCommon = useTranslations("common");
  const tNextSteps = useTranslations("projects.transitions.nextSteps");
  const tStages = useTranslations("projects.stages");
  const translateNextStep = (key: string) =>
    tNextSteps(key as Parameters<typeof tNextSteps>[0]);
  const stageT = (key: string) => tStages(key as Parameters<typeof tStages>[0]);
  const translatedAllStages = useMemo(
    () => translateStageConfigs(allStages, stageT),
    [tStages],
  );
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const [showRegressDialog, setShowRegressDialog] = useState(false);
  const currentStage = project.status;
  const currentIndex = allStages.findIndex((s) => s.key === currentStage);
  const isCancelled = currentStage === "CANCELLED";
  const isMaintenanceSupport = currentStage === "MAINTENANCE";
  const currentStageConfig: TranslatedStageConfig | null = isCancelled
    ? translateStageConfig(cancelledStage, stageT)
    : currentIndex >= 0
      ? translatedAllStages[currentIndex]
      : null;

  const nextStage =
    !isCancelled && currentIndex < allStages.length - 1
      ? translatedAllStages[currentIndex + 1]
      : null;
  const prevStage =
    !isCancelled && currentIndex > 0
      ? translatedAllStages[currentIndex - 1]
      : null;

  // Determine flow context
  const isInCommercial = commercialStages.some((s) => s.key === currentStage);
  const isInOperational = operationalStages.some((s) => s.key === currentStage);
  const isInCommercialClosing = commercialClosingStages.some(
    (s) => s.key === currentStage,
  );

  const handleCancel = async () => {
    const result = await cancelProjectAction(project.id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message);
    setShowCancelDialog(false);
  };

  const isAutomaticStep = [
    "WAITING_SIGNATURE",
    "WAITING_DOWN_PAYMENT",
  ].includes(project.status);

  const canTransition =
    canUpdate && (!isAutomaticStep || isOwner);
  const hasActions = canTransition || canDelete;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Maintenance & Support */}
        {(isMaintenanceSupport || currentStage === "COMPLETED") && (
          <div
            className={cn(
              "p-4 rounded-lg flex items-center gap-4",
              isMaintenanceSupport
                ? "bg-teal-500/10 border border-teal-500/20"
                : "bg-muted/30",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-full",
                isMaintenanceSupport
                  ? "bg-teal-500 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h4
                className={cn(
                  "font-semibold",
                  isMaintenanceSupport
                    ? "text-teal-600 dark:text-teal-400"
                    : "",
                )}
              >
                {t("maintenance.title")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isMaintenanceSupport
                  ? t("maintenance.activeDescription")
                  : t("maintenance.inactiveDescription")}
              </p>
            </div>
          </div>
        )}

        {/* Current Stage Info & Actions */}
        {!isCancelled && currentStageConfig && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentStageConfig.color}`}>
                  <currentStageConfig.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{currentStageConfig.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentStageConfig.description}
                  </p>
                </div>
                {isAutomaticStep && (
                  <Badge variant="secondary" className="text-sm p-2">
                    {t("automaticStepBadge")}
                  </Badge>
                )}
              </div>

              {/* Inline Actions */}
              {hasActions && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {canTransition && (
                    <>
                      {prevStage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRegressDialog(true)}
                        >
                          {t("actions.regress")}
                        </Button>
                      )}
                      {nextStage && currentStageConfig?.nextAction && (
                        <Button
                          size="sm"
                          onClick={() => setShowAdvanceDialog(true)}
                          className="gap-1"
                        >
                          {t("actions.advancePrefix")}{" "}
                          {!["PROPOSAL", "PROPOSAL_GENERATED"].includes(
                            currentStageConfig.key,
                          ) && currentStageConfig.nextAction}
                          {currentStageConfig.key === "PROPOSAL" &&
                            getProposalNextStepLabel(
                              project.proposal,
                              translateNextStep,
                            )}
                          {currentStageConfig.key === "PROPOSAL_GENERATED" &&
                            getContractNextStepLabel(
                              project.contract,
                              translateNextStep,
                            )}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCancelDialog(true)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advance Dialog */}
        {canUpdate && nextStage && (
          <ProjectTransitionDialog
            currentStatusLabel={project.status}
            isOpen={showAdvanceDialog}
            onOpenChange={setShowAdvanceDialog}
            project={project}
            targetStatus={nextStage.key}
            targetStatusLabel={nextStage.label}
            contextData={contextData}
          />
        )}
        {/* Regress Dialog */}
        {canUpdate && currentStageConfig && (
          <RegressDialog
            showRegressDialog={showRegressDialog}
            currentStageConfig={currentStageConfig}
            prevStage={prevStage}
            project={project}
            setShowRegressDialog={setShowRegressDialog}
            contextData={contextData}
          />
        )}

        {/* Cancel Dialog */}
        {canDelete && (
          <AlertDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("cancelDialog.title")}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span>{t("cancelDialog.description")}</span>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tCommon("back")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {t("cancelDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {/* Cancelled State */}
        {isCancelled && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                {t("cancelled.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("cancelled.description")}
              </p>
            </div>
          </div>
        )}

        {/* Commercial Flow */}
        <FlowSection
          category={t("flows.commercial.title")}
          title={t("flows.commercial.title")}
          isInThisFlow={isInCommercial}
          stages={commercialStages}
          currentStage={currentStage}
          bgColor="bg-muted/30"
          isCancelled={isCancelled}
          allStages={allStages}
        />

        {/* Operational Flow */}
        <FlowSection
          category={t("flows.operational.category")}
          title={t("flows.operational.title")}
          isInThisFlow={isInOperational}
          stages={operationalStages}
          currentStage={currentStage}
          bgColor="bg-primary/5 border border-primary/10"
          isCancelled={isCancelled}
          allStages={allStages}
          compact={true}
        />

        {/* Commercial Closing Flow */}
        <FlowSection
          category={t("flows.closing.category")}
          isInThisFlow={isInCommercialClosing}
          title={t("flows.closing.title")}
          stages={commercialClosingStages}
          currentStage={currentStage}
          bgColor="bg-muted/30"
          isCancelled={isCancelled}
          allStages={allStages}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
