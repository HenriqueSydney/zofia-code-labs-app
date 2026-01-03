import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  expenseCategorySchema,
  type ExpenseCategorySchema,
} from "@/schemas/expenses/expenseCategorySchema";
import { updateExpenseCategoryAction } from "@/actions/expenses/updateExpenseCategoryAction";
import { createExpenseCategoryAction } from "@/actions/expenses/createExpenseCategoryAction";
import { ExpenseNature } from "@/generated/prisma/enums";
import { expenseNatureOptions } from "@/mappers/expenseNatureMapper";

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
        expenseCategory ? "Categoria atualizada!" : "Categoria criada!"
      );
      if (!expenseCategory) form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome da Categoria */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Infraestrutura Cloud"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Natureza da Despesa (Select via Mapper) */}
        <FormField
          control={form.control}
          name="nature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Natureza Financeira</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a natureza..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseNatureOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição opcional para identificar os gastos desta categoria"
                  className="resize-none"
                  rows={3}
                  disabled={isPending}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
