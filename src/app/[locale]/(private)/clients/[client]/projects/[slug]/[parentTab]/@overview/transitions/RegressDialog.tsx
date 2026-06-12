"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Actions e Utils
import { cancelProposalAction } from "@/actions/proposal/cancelProposal";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";
import { checkIfProposalIsEditable } from "@/utils/checkIfProposalIsEditable";
import { TranslatedStageConfig } from "@/mappers/projectStageMapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";

// Estratégias e Componentes
import { getRegressStrategies } from "./RegressStrategiesForms";
import { FormTextarea } from "@/components/form/FormTextarea";
import { useTranslations } from "next-intl";
import { cancelContractAction } from "@/actions/contract/cancelContract";

interface IRegressDialog {
  currentStageConfig: TranslatedStageConfig;
  prevStage: TranslatedStageConfig | null;
  setShowRegressDialog: Dispatch<SetStateAction<boolean>>;
  showRegressDialog: boolean;
  project: ProjectWithDetails;
  contextData: any;
}

export function RegressDialog({
  project,
  currentStageConfig,
  prevStage,
  setShowRegressDialog,
  showRegressDialog,
  contextData,
}: IRegressDialog) {
  const t = useTranslations("projects.transitions.regress");
  const tCommon = useTranslations("projects.transitions.common");
  const [isPending, startTransition] = useTransition();

  const regressStrategies = useMemo(
    () => getRegressStrategies((key) => t(key as never)),
    [t],
  );

  const strategyKey = prevStage?.key ?? "DEFAULT";

  const strategy = useMemo(() => {
    if (strategyKey === "DEFAULT") {
      return regressStrategies.DEFAULT;
    }
    return regressStrategies[strategyKey] ?? regressStrategies.DEFAULT;
  }, [regressStrategies, strategyKey]);

  const form = useForm({
    resolver: zodResolver(strategy.schema),
    defaultValues: strategy.defaultValues,
  });

  useEffect(() => {
    if (showRegressDialog) {
      form.reset(strategy.defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset apenas ao abrir ou mudar etapa alvo
  }, [showRegressDialog, strategyKey]);

  const onSubmit = (values: any) => {
    if (!prevStage) return;

    startTransition(async () => {
      try {
        // Lógica de cancelamento de proposta (se aplicável)
        if (["PROPOSAL"].includes(currentStageConfig.key) && project.proposal) {
          const cancelResult = await cancelProposalAction(project.proposal.id);
          if (cancelResult.error) {
            toast.error(cancelResult.error);
            return;
          }
          // Se estava apenas na etapa de proposta e foi cancelada
          if (project.proposal.status !== "DRAFT") {
            toast.info(t("proposalCancelledSuccess"));
            setShowRegressDialog(false);
            return;
          }
        }

        if (
          ["PROPOSAL_GENERATED"].includes(currentStageConfig.key) &&
          project.contract
        ) {
          if (["REVIEW", "SENT"].includes(project.contract.status)) {
            const cancelResult = await cancelContractAction(
              project.contract.id,
            );
            if (cancelResult.error) {
              toast.error(cancelResult.error);
              return;
            }

            toast.info(t("contractCancelledSuccess"));
            setShowRegressDialog(false);
            return;
          }
        }

        // Executa a regressão de status
        const result = await changeProjectStatusAction({
          projectId: project.id,
          newStatus: prevStage.key,
          data: {
            ...contextData,
            ...values,
            isRegress: true, // Flag para o backend identificar regressão
          },
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success(`${t("success")}: ${prevStage.label}`);
        setShowRegressDialog(false);
      } catch (error) {
        toast.error(tCommon("errors.unexpected"));
      }
    });
  };

  const { canBeCancelled } = checkIfProposalIsEditable(
    project.proposal?.status,
  );
 
  return (
    <AlertDialog open={showRegressDialog} onOpenChange={setShowRegressDialog}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl flex items-center gap-2">
            {t("dialogTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialogDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            {/* Alerta de Destruição (Cancelamento de Proposta) */}
            {canBeCancelled && currentStageConfig.key === "PROPOSAL" && (
              <Alert
                variant="destructive"
                className="bg-destructive/10 border-destructive/20 text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("attentionTitle")}</AlertTitle>
                <AlertDescription>{t("proposalWarning")}</AlertDescription>
              </Alert>
            )}

            {/* Indicador Visual da Movimentação */}
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                {t.rich("movingFromTo", {
                  from: currentStageConfig.label,
                  to: prevStage?.label ?? "",
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>

            <Separator />

            {/* Campos Dinâmicos da Estratégia (Renderizados do RegressStrategiesForms)
              Geralmente contém o FormSelect refatorado anteriormente
            */}
            {strategy.renderExtraFields && strategy.renderExtraFields(form)}

            {/* Campo de Justificativa Padrão */}
            <FormTextarea
              control={form.control}
              name="observation"
              label={t("justificationLabel")}
              placeholder={t("justificationPlaceholder")}
              rows={4}
              disabled={isPending}
            />

            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel
                disabled={isPending}
                onClick={() => form.reset()}
              >
                {tCommon("cancel")}
              </AlertDialogCancel>

              <Button
                type="submit"
                variant="destructive"
                disabled={isPending}
                className="min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon("processing")}
                  </>
                ) : (
                  t("confirm")
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
