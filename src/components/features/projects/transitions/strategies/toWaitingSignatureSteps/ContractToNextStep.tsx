"use client";

import { changeContractStatusAction } from "@/actions/contract/changeContractStatus";
import { Button } from "@/components/ui/button";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IContractToNextStep {
  project: ProjectWithDetails;
  onSuccess: () => void;
  onCancel: () => void;
  contract: ContractWithDetails;
}

export function ContractToNextStep({
  project,
  onSuccess,
  onCancel,
  contract
}: IContractToNextStep) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleContract(action: "CANCELLED" | "SIGNED") {
    if (!contract) return null;
    setIsLoading(true);
    try {
      // Aqui você pode passar o data.communicationChannel para sua action se necessário
      const result = await changeContractStatusAction(contract.id, action);

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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
      <Button variant="outline" onClick={() => handleContract("CANCELLED")}>
        <ThumbsUp className="w-4 h-4" />
        Informar rejeição do contrato
      </Button>
      <Button onClick={() => handleContract("SIGNED")}>
        <ThumbsUp className="w-4 h-4" />
        Confirmar assinatura do cliente
      </Button>
    </div>
  );
}
