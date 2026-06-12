"use client";

import { ProposalCreationForm } from "./toProposalGeneratedSteps/ProposalCreationForm";
import { TransitionStrategyProps } from "../types";
import { ProposalReview } from "./toProposalGeneratedSteps/ProposalReview";
import { ProposalSendToClient } from "./toProposalGeneratedSteps/ProposalSendToClient";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { useCallback, useEffect, useState } from "react";
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

  const proposalId = project.proposal?.id;

  const getProposalWithDetails = useCallback(async () => {
    if (!proposalId) return;
    setIsLoading(true);
    try {
      const result = await getProposalAction(proposalId);
      setProposal(result);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error("Erro ao tentar localizar dados da proposta");
    } finally {
      setIsLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    getProposalWithDetails();
  }, [getProposalWithDetails]);

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
