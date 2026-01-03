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
import { ClientEmployeeForm } from "./ClientEmployeeForm";

interface IClientEmployeeCreateForm {
  clientSlug: string;
}

export function ClientEmployeeCreateForm({
  clientSlug,
}: IClientEmployeeCreateForm) {
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
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>Preencha os dados do usuário</DialogDescription>
        </DialogHeader>

        <ClientEmployeeForm
          clientSlug={clientSlug}
          handleCloseModal={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
