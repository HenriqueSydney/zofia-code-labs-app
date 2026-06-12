"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import { getExpenseNatureOptions } from "@/mappers/expenseNatureMapper";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormSelect } from "@/components/form/FormSelect";

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
  const t = useTranslations("settings.expenses.category.form");
  const tNature = useTranslations("settings.expenses.nature");
  const tCommon = useTranslations("common");
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
        expenseCategory ? t("toastUpdateSuccess") : t("toastCreateSuccess"),
      );
      if (!expenseCategory) form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t("name")}
          name="name"
          control={form.control}
          placeholder={t("namePlaceholder")}
          disabled={isPending}
        />

        <FormSelect
          control={form.control}
          name="nature"
          label={t("nature")}
          placeholder={t("naturePlaceholder")}
          options={getExpenseNatureOptions((key) => tNature(key))}
          disabled={isPending}
        />

        <FormTextarea
          label={t("description")}
          control={form.control}
          name="description"
          placeholder={t("descriptionPlaceholder")}
          disabled={isPending}
          rows={3}
          className="resize-none"
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? tCommon("saving")
              : expenseCategory
                ? tCommon("actions.saveChanges")
                : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
