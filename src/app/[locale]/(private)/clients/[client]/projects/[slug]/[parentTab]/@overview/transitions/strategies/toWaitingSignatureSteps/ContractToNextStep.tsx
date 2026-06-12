"use client";

import { changeContractStatusAction } from "@/actions/contract/changeContractStatus";
import { Button } from "@/components/ui/button";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface IContractToNextStep {
  project: ProjectWithDetails;
  onSuccess: () => void;
  onCancel: () => void;
  contract: ContractWithDetails;
}

export function ContractToNextStep({
  onSuccess,
  contract,
}: IContractToNextStep) {
  const t = useTranslations("projects.transitions.contractToNextStep");
  const [isLoading, setIsLoading] = useState(false);

  async function handleContract(action: "CANCELLED" | "SIGNED") {
    if (!contract) return null;
    setIsLoading(true);
    try {
      const result = await changeContractStatusAction(contract.id, action);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(t("toastSuccess"));
      onSuccess();
    } catch {
      toast.error(t("toastUnexpectedError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
      <Button
        variant="outline"
        onClick={() => handleContract("CANCELLED")}
        disabled={isLoading}
      >
        <ThumbsUp className="w-4 h-4" />
        {t("reportRejection")}
      </Button>
      <Button onClick={() => handleContract("SIGNED")} disabled={isLoading}>
        <ThumbsUp className="w-4 h-4" />
        {t("confirmSignature")}
      </Button>
    </div>
  );
}
