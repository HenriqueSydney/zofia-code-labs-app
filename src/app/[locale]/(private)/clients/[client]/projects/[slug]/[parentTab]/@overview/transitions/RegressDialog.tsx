import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { cancelProposalAction } from "@/actions/proposal/cancelProposal";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";
import { checkIfProposalIsEditable } from "@/utils/checkIfProposalIsEditable";
import { StageConfig } from "@/mappers/projectStageMapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { REGRESS_STRATEGIES } from "./RegressStrategiesForms";

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
  const [isLoading, setIsLoading] = useState(false);

  // 1. Seleciona a estratégia baseada no status de DESTINO
  const strategy = prevStage
    ? REGRESS_STRATEGIES[prevStage.key] || REGRESS_STRATEGIES.DEFAULT
    : REGRESS_STRATEGIES.DEFAULT;

  const form = useForm({
    resolver: zodResolver(strategy.schema),
    defaultValues: strategy.defaultValues,
  });

  // 2. Sincroniza o form se o prevStage mudar (importante para diálogos reutilizados)
  useEffect(() => {
    if (showRegressDialog) {
      form.reset(strategy.defaultValues);
    }
  }, [showRegressDialog, strategy.defaultValues, form]);

  const onSubmit = async (values: any) => {
    if (!prevStage) return;
    setIsLoading(true);

    try {
      // Se estiver saindo da Proposta, cancela a ativa
      if (
        ["PROPOSAL", "PROPOSAL_GENERATED"].includes(currentStageConfig.key) &&
        project.proposal
      ) {
        const cancelResult = await cancelProposalAction(project.proposal.id);
        if (cancelResult.error) {
          toast.error(cancelResult.error);
          return;
        }
        if (
          project.proposal.status !== "DRAFT" &&
          currentStageConfig.key === "PROPOSAL"
        ) {
          toast.info(`Sucesso: Proposta cancelada.`);
          setShowRegressDialog(false);
          return;
        }
      }

      // Payload enriquecido para o UseCase
      const result = await changeProjectStatusAction({
        projectId: project.id,
        newStatus: prevStage.key,
        data: {
          ...contextData,
          ...values,
          isRegress: true, // Flag para o back-end saber que é um retrocesso
        },
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.info(`Sucesso: Projeto retornou para ${prevStage.label}`);
      setShowRegressDialog(false);
    } catch (error) {
      toast.error("Erro ao processar retorno de etapa.");
    } finally {
      setIsLoading(false);
    }
  };

  const { canBeCancelled } = checkIfProposalIsEditable(
    project.proposal?.status,
  );

  return (
    <AlertDialog open={showRegressDialog} onOpenChange={setShowRegressDialog}>
      <AlertDialogContent className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Retornar Etapa do Projeto
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="flex flex-col space-y-4 pt-2 text-foreground">
                  {canBeCancelled && currentStageConfig.key === "PROPOSAL" && (
                    <Alert variant="destructive" className="bg-destructive/5">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Atenção</AlertTitle>
                      <AlertDescription>
                        A proposta atual será <strong>cancelada</strong>{" "}
                        permanentemente.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent rounded-lg text-foreground">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">
                      Movendo de <strong>{currentStageConfig.label}</strong>{" "}
                      para <strong>{prevStage?.label}</strong>.
                    </p>
                  </div>

                  <Separator />

                  {/* Campos Extra da Estratégia (Selects de Motivação) */}
                  {strategy.renderExtraFields &&
                    strategy.renderExtraFields(form)}

                  {/* Campo Padrão de Observação */}
                  <FormField
                    control={form.control}
                    name="observation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justificativa Detalhada</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explique detalhadamente o motivo deste retorno para registro no histórico..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isLoading}
                onClick={() => form.reset()}
              >
                Cancelar
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
