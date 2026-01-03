"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProposalCreationForm } from "@/components/features/projects/transitions/strategies/toProposalGeneratedSteps/ProposalCreationForm";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { useState } from "react";

interface ICreateNewProposalButton {
  project: ProjectWithDetails;
}

export function CreateNewProposalButton({ project }: ICreateNewProposalButton) {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => onOpenChange(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Proposta
      </Button>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] ">
          <DialogHeader>
            <DialogTitle>Criar nova proposta</DialogTitle>
          </DialogHeader>

          <ProposalCreationForm
            project={project}
            targetStatus={"PROPOSAL_GENERATED"}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            contextData={{}}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
