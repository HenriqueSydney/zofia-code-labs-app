"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContractCreationForm } from "@/components/features/projects/transitions/strategies/toWaitingSignatureSteps/ContractCreationForm";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { useState } from "react";

interface ICreateNewContractButton {
  project: ProjectWithDetails;
}

export function CreateNewContractButton({ project }: ICreateNewContractButton) {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => onOpenChange(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Contrato
      </Button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] ">
          <DialogHeader>
            <DialogTitle>Criar nova contrato</DialogTitle>
          </DialogHeader>

          <ContractCreationForm
            project={project}
            targetStatus="WAITING_SIGNATURE"
            onCancel={() => onOpenChange(false)}
            contextData={{}}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
