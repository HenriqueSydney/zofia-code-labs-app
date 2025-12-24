"use client";

import { ProposalCreationForm } from "./toProposalGeneratedSteps/ProposalCreationForm";
import { TransitionStrategyProps } from "../types";
import { ProposalEditor } from "./toProposalGeneratedSteps/ProposalEditor";
import { ProposalReview } from "./toProposalGeneratedSteps/ProposalReview";
import { ProposalSendToClient } from "./toProposalGeneratedSteps/ProposalSendToClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp } from "lucide-react";
import { ProposalDetails } from "@/components/ProposalDetail";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { getProposalAction } from "@/actions/proposal/getProposal";

export function ToProposalGenerated({
  project,
  targetStatus,
  onSuccess,
  onCancel,
}: TransitionStrategyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<ProposalWithDetails | null>(null);

  async function getProposalWithDetails() {
    if (!project.proposal) return null;
    try {
      const result = await getProposalAction(project.proposal.id);

      setProposal(result);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error("Erro ao tentar localizar dados da proposta");
    }
  }

  useEffect(() => {
    setIsLoading(true);
    getProposalWithDetails();
    setIsLoading(false);
  }, [project]);

  // ESTÁGIO 1: Criação
  // Se não existe proposta vinculada ao projeto, mostra o formulário de criação/upload
  if (!project.proposal) {
    return (
      <ProposalCreationForm
        project={project}
        onSuccess={() => {
          window.location.reload();
        }}
        onCancel={onCancel}
        targetStatus={targetStatus} // Passamos, mas talvez só mudemos o status no final
      />
    );
  }

  // ESTÁGIO 2: Edição (Apenas para Templates)
  // Se existe, é template e ainda não foi aprovada internamente
  if (
    proposal &&
    proposal.sourceType === "SYSTEM_TEMPLATE" &&
    proposal.status === "DRAFT"
  ) {
    return (
      <ProposalEditor
        proposal={proposal}
        project={project}
        onApproved={onSuccess}
        contextData={proposal}
      />
    );
  }

  // // ESTÁGIO 3: Revisão/Aprovação (Para Uploads ou pós-edição)
  // // Se existe e não foi aprovada (caso de upload direto)
  if (proposal && proposal.status === "REVIEW") {
    return <ProposalReview proposal={proposal} onSuccess={onSuccess} />;
  }

  if (proposal && proposal.status === "APPROVED") {
    return <ProposalSendToClient proposal={proposal} onSuccess={onSuccess} />;
  }

  async function handleProposal(action: "REJECTED" | "ACCEPTED") {
    if (!proposal) return;
    setIsLoading(true);
    try {
      // Aqui você pode passar o data.communicationChannel para sua action se necessário
      const result = await changeProposalStatusAction(proposal.id, action);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Proposta atualizada com sucesso");
      onSuccess();
    } catch (error) {
      toast.error("Erro inesperado ao encaminhar a proposta ao cliente.");
    } finally {
      setIsLoading(false);
    }
  }

  // ESTÁGIO 4: Já Aprovado
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Alert className="bg-green-800/10 border-green-300/30 col-span-2">
          <ThumbsUp className="h-4 w-4" />
          <AlertTitle>Proposta gerada e aprovada</AlertTitle>
          <AlertDescription>
            {proposal && proposal.approvedAt && (
              <span>
                Proposta gerada e aprovada em:{" "}
                {new Date(proposal.approvedAt).toLocaleDateString()}.
              </span>
            )}
            {proposal && !proposal.approvedAt && (
              <span>Proposta gerada e aprovada</span>
            )}
            <br />
            Aguardando envio/resposta do cliente.
          </AlertDescription>
        </Alert>
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
          <Button variant="outline" onClick={() => handleProposal("REJECTED")}>
            <ThumbsUp className="w-4 h-4" />
            Informar rejeição de proposta
          </Button>
          <Button onClick={() => handleProposal("ACCEPTED")}>
            <ThumbsUp className="w-4 h-4" />
            Confirmar aceite do Cliente
          </Button>
        </div>
      </div>
      <Separator />
      {proposal && <ProposalDetails proposal={proposal} />}
    </div>
  );
}
