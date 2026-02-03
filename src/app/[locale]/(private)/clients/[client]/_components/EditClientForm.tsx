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

import { Edit } from "lucide-react";
import { ClientForm } from "../../_components/ClientForm";

interface IEditClientForm {
  client: {
    id: string;
    companyName: string;
    tradeName?: string | null;
    cnpj?: string | null;
    email?: string | null;
    phone?: string | null;
    logoUrl?: string | null; // Adicionado para exibir logo existente na edição
  };
}

export function EditClientForm({ client }: IEditClientForm) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>Preencha os dados do cliente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4"></div>
        <ClientForm
          client={client}
          handleCloseModal={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
