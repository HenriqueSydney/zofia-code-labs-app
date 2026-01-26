import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  expenseCategorySchema,
  type ExpenseCategorySchema,
} from "@/schemas/expenses/expenseCategorySchema";
import { updateExpenseCategoryAction } from "@/actions/expenses/updateExpenseCategoryAction";
import { createExpenseCategoryAction } from "@/actions/expenses/createExpenseCategoryAction";
import { ExpenseNature } from "@/generated/prisma/enums";
import { expenseNatureOptions } from "@/mappers/expenseNatureMapper";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormSelect } from "@/components/form/FormSelect";

// Importando o Mapper e as Opções

interface IExpenseCategoryFormProps {
  expenseCategory?: {
    id: string;
    name: string;
    description?: string | null;
    nature?: ExpenseNature;
  };
  handleCloseModal: () => void;
}

export function ExpenseCategoryForm({
  expenseCategory,
  handleCloseModal,
}: IExpenseCategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExpenseCategorySchema>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: {
      name: expenseCategory?.name ?? "",
      description: expenseCategory?.description ?? "",
      nature: expenseCategory?.nature ?? "OPERATIONAL",
    },
  });

  const onSubmit = (data: ExpenseCategorySchema) => {
    startTransition(async () => {
      const result = expenseCategory
        ? await updateExpenseCategoryAction({ ...data, id: expenseCategory.id })
        : await createExpenseCategoryAction(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        expenseCategory ? "Categoria atualizada!" : "Categoria criada!",
      );
      if (!expenseCategory) form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome da Categoria */}
        <FormInput
          label="Nome da Categoria *"
          name="name"
          control={form.control}
          placeholder="Ex: Infraestrutura Cloud"
          disabled={isPending}
        />

        {/* Natureza da Despesa (Select via Mapper) */}
        <FormSelect
          control={form.control}
          name="nature"
          label="Natureza Financeira"
          placeholder="Selecione a natureza..."
          options={expenseNatureOptions}
          disabled={isPending}
        />

        {/* Descrição */}
        <FormTextarea
          label="Descrição"
          control={form.control}
          name="description"
          placeholder="Descrição opcional para identificar os gastos desta categoria"
          disabled={isPending}
          rows={3}
          className="resize-none"
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : expenseCategory
                ? "Salvar Alterações"
                : "Criar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
