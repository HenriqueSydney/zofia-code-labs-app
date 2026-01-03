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
import { ExpenseCategoryForm } from "./ExpenseCategoryForm";

export function CreateExpenseCategoryForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria de Despesa</DialogTitle>
          <DialogDescription>
            Preencha os dados da categoria de despesa
          </DialogDescription>
        </DialogHeader>
        <ExpenseCategoryForm handleCloseModal={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
