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
// Certifique-se de que o arquivo do form se chama ExpenseForm.tsx
import { ExpenseForm } from "./ExpenseForm";

interface ICreateExpenseFormProps {
  projectSlug: string;
}

export function CreateExpenseForm({ projectSlug }: ICreateExpenseFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {/* Adicionei variant="destructive" como sugestão para indicar "saída/gasto", 
            mas pode remover para manter a cor padrão */}
        <Button size="lg" variant="destructive">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
          <DialogDescription>
            Registre uma nova saída financeira ou conta a pagar.
          </DialogDescription>
        </DialogHeader>

        <ExpenseForm
          projectSlug={projectSlug}
          handleCloseModal={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
