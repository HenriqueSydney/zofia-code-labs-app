"use client"; // Mantenha como Client Component para modais

import { useEffect, useState, useCallback } from "react";
import { ContractCreationForm } from "./toWaitingSignatureSteps/ContractCreationForm";
import { TransitionStrategyProps } from "../types";
import { ContractSendToClient } from "./toWaitingSignatureSteps/ContractSendToClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp, Loader2, AlertCircle } from "lucide-react";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { Separator } from "@/components/ui/separator";
import { ContractEditor } from "./toWaitingSignatureSteps/ContractEditor";
import { operationWrapper } from "@/lib/operationWrapper";
import { getContractAction } from "@/actions/contract/getContract";
import { ContractToNextStep } from "./toWaitingSignatureSteps/ContractToNextStep";
import { toast } from "sonner";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { ProposalDetails } from "@/components/ProposalDetail";

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
  const [isProposalLoading, setIsProposalLoading] = useState(true);
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
    } catch (error) {
      console.error("[ToWaitingSignature] Erro:", error);
      if (error instanceof Error) {
        setError(error?.message || "Erro ao carregar proposta");
      } else {
        setError("Erro ao carregar proposta");
      }

      toast.error("Não foi possível carregar os detalhes do contrato.");
    }

    setIsLoading(false);
  }, [project.proposal?.id]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  // Estado de Carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Carregando detalhes do contrato...
        </p>
      </div>
    );
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

  // ESTÁGIO 2: Editor (Draft)

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

  // ESTÁGIO 4: Já Aprovado / Próximo Passo
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Alert className="bg-green-800/10 border-green-300/30">
          <ThumbsUp className="h-4 w-4 text-green-600" />
          <AlertTitle>Proposta gerada e aprovada</AlertTitle>
          <AlertDescription>
            {contract?.approvedAt ? (
              <span>
                Aprovada em:{" "}
                {new Date(contract.approvedAt).toLocaleDateString()}.
              </span>
            ) : (
              <span>Proposta pronta para assinatura.</span>
            )}
            <br />
            Aguardando envio ou confirmação do cliente.
          </AlertDescription>
        </Alert>

        {contract && (
          <ContractToNextStep
            contract={contract}
            onCancel={onCancel}
            onSuccess={onSuccess}
            project={project}
          />
        )}
      </div>
      <Separator />
    </div>
  );
}
