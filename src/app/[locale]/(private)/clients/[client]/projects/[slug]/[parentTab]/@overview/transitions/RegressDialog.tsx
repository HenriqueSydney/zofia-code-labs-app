"use client";

import { Dispatch, SetStateAction, useEffect, useTransition } from "react";
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
import { StageConfig } from "@/mappers/projectStageMapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";

// Estratégias e Componentes
import { REGRESS_STRATEGIES } from "./RegressStrategiesForms";
import { FormTextarea } from "@/components/form/FormTextarea";

interface IRegressDialog {
  currentStageConfig: StageConfig;
  prevStage: StageConfig | null;
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
  const [isPending, startTransition] = useTransition();

  // 1. Seleciona a estratégia baseada no status de DESTINO (para onde estamos voltando)
  const strategy = prevStage
    ? REGRESS_STRATEGIES[prevStage.key] || REGRESS_STRATEGIES.DEFAULT
    : REGRESS_STRATEGIES.DEFAULT;

  const form = useForm({
    resolver: zodResolver(strategy.schema),
    defaultValues: strategy.defaultValues,
  });

  // 2. Reseta o form quando o diálogo abre ou a estratégia muda
  useEffect(() => {
    if (showRegressDialog) {
      form.reset(strategy.defaultValues);
    }
  }, [showRegressDialog, strategy.defaultValues, form]);

  const onSubmit = (values: any) => {
    if (!prevStage) return;

    startTransition(async () => {
      try {
        // Lógica de cancelamento de proposta (se aplicável)
        if (
          ["PROPOSAL", "PROPOSAL_GENERATED"].includes(currentStageConfig.key) &&
          project.proposal
        ) {
          const cancelResult = await cancelProposalAction(project.proposal.id);
          if (cancelResult.error) {
            toast.error(cancelResult.error);
            return;
          }
          // Se estava apenas na etapa de proposta e foi cancelada
          if (
            project.proposal.status !== "DRAFT" &&
            currentStageConfig.key === "PROPOSAL"
          ) {
            toast.info(`Sucesso: Proposta cancelada.`);
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

        toast.success(`Projeto retornado para etapa: ${prevStage.label}`);
        setShowRegressDialog(false);
      } catch (error) {
        toast.error("Erro inesperado ao processar o retorno de etapa.");
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
            Retornar Etapa do Projeto
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação moverá o projeto para a fase anterior. Justifique a
            decisão abaixo.
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
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  A proposta atual será{" "}
                  <strong>cancelada permanentemente</strong> ao voltar desta
                  etapa.
                </AlertDescription>
              </Alert>
            )}

            {/* Indicador Visual da Movimentação */}
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Movendo de <strong>{currentStageConfig.label}</strong> para{" "}
                <strong>{prevStage?.label}</strong>.
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
              label="Justificativa Detalhada"
              placeholder="Explique detalhadamente o motivo deste retorno para o histórico..."
              rows={4}
              disabled={isPending}
            />

            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel
                disabled={isPending}
                onClick={() => form.reset()}
              >
                Cancelar
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
                    Processando...
                  </>
                ) : (
                  "Confirmar Retorno"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
