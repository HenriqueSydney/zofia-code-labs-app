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
import { ClientForm } from "./ClientForm";

export function CreateClientForm() {
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
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>Preencha os dados do cliente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4"></div>
        <ClientForm handleCloseModal={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
