"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import { BacklogForm } from "./BacklogForm";

interface IBacklogCreateForm {
  projectId: string;
}

export function BacklogCreateForm({ projectId }: IBacklogCreateForm) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os dados do item do novo backlog
          </DialogDescription>
        </DialogHeader>

        <BacklogForm
          projectId={projectId}
          handleCloseModal={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
