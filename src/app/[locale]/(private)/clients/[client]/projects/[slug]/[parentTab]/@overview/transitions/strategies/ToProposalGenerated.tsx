"use client";

import { ProposalCreationForm } from "./toProposalGeneratedSteps/ProposalCreationForm";
import { TransitionStrategyProps } from "../types";
import { ProposalEditor } from "./toProposalGeneratedSteps/ProposalEditor";
import { ProposalReview } from "./toProposalGeneratedSteps/ProposalReview";
import { ProposalSendToClient } from "./toProposalGeneratedSteps/ProposalSendToClient";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { ProposalDetailsModalSkeleton } from "@/components/skeletons/ProposalDetailsModalSkeleton";
import { ProposalConfirmation } from "./toProposalGeneratedSteps/ProposalConfirmation";

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
    setIsLoading(true);
    try {
      const result = await getProposalAction(project.proposal.id);

      setProposal(result);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      toast.error("Erro ao tentar localizar dados da proposta");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getProposalWithDetails();
  }, [project]);

  if (isLoading) {
    return <ProposalDetailsModalSkeleton />;
  }

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

  if (proposal) {
    return <ProposalConfirmation proposal={proposal} onSuccess={onSuccess} />;
  }

  return null;
}
