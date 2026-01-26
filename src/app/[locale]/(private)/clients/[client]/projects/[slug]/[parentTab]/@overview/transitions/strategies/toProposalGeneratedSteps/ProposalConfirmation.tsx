"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProposalDetails } from "@/components/ProposalDetail";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { date } from "@/lib/dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IProposalConfirmation {
  proposal: ProposalWithDetails;
  onSuccess: () => void;
}

export function ProposalConfirmation({
  proposal,
  onSuccess,
}: IProposalConfirmation) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);

  // Estados do formulário de rejeição
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  async function handleProposal(
    action: "REJECTED" | "ACCEPTED",
    reason?: string,
    notes?: string,
  ) {
    if (!proposal) return;

    setIsLoading(true);
    try {
      let rejectFormDetails;
      if (action === "REJECTED") {
        rejectFormDetails = {
          reason,
          notes,
        };
      }
      const result = await changeProposalStatusAction(
        proposal.id,
        action,
        undefined, // Idealmente viria de um estado de seleção de canal
        rejectFormDetails,
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
      // Ignora erro de redirecionamento interno do Next.js
      if (error.message === "NEXT_REDIRECT") return;

      toast.error("Erro ao processar a requisição.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmitRejection = () => {
    if (!rejectionReason) {
      toast.error("Por favor, selecione um motivo para a rejeição.");
      return;
    }
    const fullNotes = `Motivo: ${rejectionReason}. Obs: ${rejectionNotes}`;
    handleProposal("REJECTED", rejectionReason, fullNotes);
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

        {/* Ações Principais */}
        {!isRejectFormOpen && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              className="hover:!bg-destructive/10 hover:text-destructive w-full sm:w-auto"
              onClick={() => setIsRejectFormOpen(true)}
              disabled={isLoading}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Informar Rejeição
            </Button>

            <Button
              onClick={() => handleProposal("ACCEPTED")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Confirmar Aceite do Cliente
            </Button>
          </div>
        )}
        {isRejectFormOpen && (
          <Card>
            <CardHeader className="w-full flex flex-row items-center justify-between ">
              <CardTitle className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-destructive" />
                Detalhes da Rejeição
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRejectFormOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo Principal</Label>
                  <Select onValueChange={setRejectionReason}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Selecione o motivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preço elevado">
                        Preço acima do orçamento
                      </SelectItem>
                      <SelectItem value="Prazo de entrega">
                        Prazo de entrega inviável
                      </SelectItem>
                      <SelectItem value="Concorrência">
                        Escolheu outro fornecedor
                      </SelectItem>
                      <SelectItem value="Escopo">
                        Escopo não atende às necessidades
                      </SelectItem>
                      <SelectItem value="Outro">Outro motivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Observações Adicionais (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Descreva detalhes sobre a decisão do cliente..."
                    className="min-h-[100px]"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRejectFormOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleSubmitRejection}
                    disabled={isLoading || !rejectionReason}
                  >
                    {isLoading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Confirmar Rejeição
                  </Button>
                </div>
              </div>
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
