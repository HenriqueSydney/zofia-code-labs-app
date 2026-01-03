"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExpenseCategoryForm } from "./ExpenseCategoryForm";
import { useState } from "react";
import { toast } from "sonner";
import { CreateExpenseCategoryDTO } from "@/repositories/IExpenseCategoryRepository";
import { deleteExpenseCategoryAction } from "@/actions/expenses/deleteExpenseCategoryAction";

interface IServiceTypeRemoveOrEdit {
  expenseCategory: CreateExpenseCategoryDTO & { id: string };
}

export function ExpenseCategoryRemoveOrEdit({
  expenseCategory,
}: IServiceTypeRemoveOrEdit) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteExpenseCategoryAction(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Categoria de Despesa criado com sucesso!");
  }

  return (
    <div className="flex">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="flex items-center justify-center"
          >
            <Edit className="h-4 w-4 " />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Categoria de Despesa</DialogTitle>
            <DialogDescription>
              Preencha os dados da categoria de despesa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <ExpenseCategoryForm
            expenseCategory={expenseCategory}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleDelete(expenseCategory.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
