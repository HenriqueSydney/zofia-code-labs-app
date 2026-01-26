"use client"; // Mantenha como Client Component para modais

import { useEffect, useState, useCallback } from "react";
import { ContractCreationForm } from "./toWaitingSignatureSteps/ContractCreationForm";
import { TransitionStrategyProps } from "../types";
import { ContractSendToClient } from "./toWaitingSignatureSteps/ContractSendToClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp, AlertCircle } from "lucide-react";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { Separator } from "@/components/ui/separator";
import { ContractEditor } from "./toWaitingSignatureSteps/ContractEditor";
import { getContractAction } from "@/actions/contract/getContract";
import { ContractToNextStep } from "./toWaitingSignatureSteps/ContractToNextStep";
import { toast } from "sonner";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { ProposalDetails } from "@/components/ProposalDetail";
import { ProposalDetailsModalSkeleton } from "@/components/skeletons/ProposalDetailsModalSkeleton";

export function ToWaitingSignature({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [proposal, setProposal] = useState<ProposalWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposalLoading, setIsProposalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Memoize a função de busca para evitar re-declarações desnecessárias
  const loadContract = useCallback(async () => {
    if (!project.contract?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contractSuccess = await getContractAction(project.contract.id);
      setContract(contractSuccess);
    } catch (error) {
      console.error("[ToWaitingSignature] Erro:", error);
      if (error instanceof Error) {
        setError(error?.message || "Erro ao carregar contrato");
      } else {
        setError("Erro ao carregar contrato");
      }

      toast.error("Não foi possível carregar os detalhes do contrato.");
    }

    setIsLoading(false);
  }, [project.contract?.id]);

  const loadProposal = useCallback(async () => {
    if (!project.proposal.id) {
      setIsProposalLoading(false);
      return;
    }

    setIsProposalLoading(true);
    setProposalError(null);

    try {
      const proposalSuccess = await getProposalAction(project.proposal.id);
      setProposal(proposalSuccess);
    } catch (error: any) {
      setError(error?.message || "Erro ao carregar proposta");
      toast.error("Não foi possível carregar os detalhes do contrato.");
    } finally {
      setIsProposalLoading(false);
    }
  }, [project.proposal?.id]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  if (isLoading || isProposalLoading) {
    return <ProposalDetailsModalSkeleton />;
  }

  // Estado de Erro
  if (error || (!contract && project.contract)) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro no Contrato</AlertTitle>
        <AlertDescription>
          {error || "Detalhes do contrato não localizados."}
          <button
            onClick={() => loadContract()}
            className="block mt-2 underline text-xs"
          >
            Tentar novamente
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {/* COLUNA ESQUERDA: Detalhes da Proposta */}
        <div className="space-y-4">
          <div className="h-10 space-y-4 mb-6">
            <h3 className="text-lg font-medium">
              Detalhes da Proposta Selecionada
            </h3>
            <Separator />
          </div>

          {proposal && <ProposalDetails proposal={proposal} />}

          {!proposal && (
            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md">
              Informações da proposta não disponíveis para visualização.
            </div>
          )}
        </div>
      </div>
      {!project.contract && (
        <ContractCreationForm
          project={project}
          onCancel={onCancel}
          targetStatus={targetStatus}
          contextData={proposal} // Passando contextData para o formulário
        />
      )}

      {contract?.sourceType === "SYSTEM_TEMPLATE" &&
        contract?.status === "DRAFT" && (
          <ContractEditor
            contract={contract}
            project={project}
            onApproved={onSuccess}
            contextData={contextData}
          />
        )}

      {contract?.status === "REVIEW" && (
        <ContractSendToClient contract={contract} onSuccess={onSuccess} />
      )}
    </div>
  );
}
