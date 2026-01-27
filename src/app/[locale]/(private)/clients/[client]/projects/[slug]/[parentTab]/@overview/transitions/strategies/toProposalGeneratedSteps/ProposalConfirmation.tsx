"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThumbsUp, ThumbsDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form"; // Importante para o wrapper

import { ProposalDetails } from "@/components/ProposalDetail";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { date } from "@/lib/dayjs";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";

// --- Schema de Validação ---
const rejectionSchema = z.object({
  reason: z
    .string({ error: "Selecione o motivo da rejeição" })
    .min(1, "Selecione um motivo"),
  notes: z.string().optional(),
});

type RejectionSchemaType = z.infer<typeof rejectionSchema>;

const REJECTION_REASONS = [
  { value: "Preço elevado", label: "Preço acima do orçamento" },
  { value: "Prazo de entrega", label: "Prazo de entrega inviável" },
  { value: "Concorrência", label: "Escolheu outro fornecedor" },
  { value: "Escopo", label: "Escopo não atende às necessidades" },
  { value: "Outro", label: "Outro motivo" },
];

interface IProposalConfirmation {
  proposal: ProposalWithDetails;
  onSuccess: () => void;
}

export function ProposalConfirmation({
  proposal,
  onSuccess,
}: IProposalConfirmation) {
  const [isPending, startTransition] = useTransition();
  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);

  // Inicializa o formulário apenas para a rejeição
  const form = useForm<RejectionSchemaType>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      reason: "",
      notes: "",
    },
  });

  // Função genérica para chamar a Server Action
  async function executeAction(
    action: "REJECTED" | "ACCEPTED",
    details?: { reason: string; notes?: string },
  ) {
    if (!proposal) return;

    startTransition(async () => {
      try {
        const result = await changeProposalStatusAction(
          proposal.id,
          action,
          undefined, // Canal (opcional)
          details, // Detalhes da rejeição (se houver)
        );

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success(
          action === "ACCEPTED"
            ? "Proposta aceita com sucesso!"
            : "Rejeição registrada.",
        );

        onSuccess();
      } catch (error: any) {
        if (error.message === "NEXT_REDIRECT") return;
        toast.error("Erro ao processar a requisição.");
      }
    });
  }

  // Handler para Aceite (Simples, sem form)
  const handleAccept = () => {
    executeAction("ACCEPTED");
  };

  // Handler para Rejeição (Vem do RHF)
  const onSubmitRejection = (data: RejectionSchemaType) => {
    executeAction("REJECTED", {
      reason: data.reason,
      notes: data.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {/* Banner de Status */}
        <Alert className="bg-green-800/10 border-green-300/30 col-span-2">
          <ThumbsUp className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Proposta Pronta para Decisão
          </AlertTitle>
          <AlertDescription className="opacity-90">
            {proposal?.approvedAt ? (
              <span>
                Gerada em:{" "}
                {date(proposal.approvedAt).format("DD/MM/YYYY HH:mm")}
              </span>
            ) : (
              <span>Aguardando formalização do cliente.</span>
            )}
            <br />
            Selecione uma das ações abaixo para atualizar o status no sistema.
          </AlertDescription>
        </Alert>

        {/* Ações Principais (Botões Iniciais) */}
        {!isRejectFormOpen && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              className="hover:!bg-destructive/10 hover:text-destructive w-full sm:w-auto"
              onClick={() => setIsRejectFormOpen(true)}
              disabled={isPending}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Informar Rejeição
            </Button>

            <Button onClick={handleAccept} disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Confirmar Aceite do Cliente
            </Button>
          </div>
        )}

        {/* Formulário de Rejeição (Renderizado Condicionalmente) */}
        {isRejectFormOpen && (
          <Card className="border-destructive/30 bg-destructive/5 animate-in fade-in slide-in-from-top-2">
            <CardHeader className="w-full flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ThumbsDown className="w-4 h-4" />
                Detalhes da Rejeição
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsRejectFormOpen(false);
                  form.reset(); // Limpa form ao fechar
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitRejection)}
                  className="grid gap-4"
                >
                  <FormSelect
                    control={form.control}
                    name="reason"
                    label="Motivo Principal"
                    placeholder="Selecione o motivo..."
                    options={REJECTION_REASONS}
                    disabled={isPending}
                  />

                  <FormTextarea
                    control={form.control}
                    name="notes"
                    label="Observações Adicionais (opcional)"
                    placeholder="Descreva detalhes sobre a decisão do cliente..."
                    rows={3}
                    disabled={isPending}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRejectFormOpen(false)}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Confirmar Rejeição
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* Detalhes da Proposta */}
      <div className="opacity-90">
        {proposal && <ProposalDetails proposal={proposal} />}
      </div>
    </div>
  );
}
