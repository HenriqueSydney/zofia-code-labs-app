"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Tag, Wallet, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import {
  ExpenseStatus,
  InternetBankingProvider,
  PaymentType,
} from "@/generated/prisma/enums";
import {
  ExpenseFormData,
  expenseSchema,
} from "@/schemas/expenses/expenseSchema";
import { listExpenseCategoryAction } from "@/actions/expenses/listExpenseCategoryAction";
import { updateExpenseAction } from "@/actions/expenses/updateExpenseAction";
import { createExpenseAction } from "@/actions/expenses/createExpenseAction";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormNumberInput } from "@/components/form/FormNumberInput";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { useTranslations } from "next-intl";

interface ExpenseCategorySimple {
  id: string;
  name: string;
}

const BANK_PROVIDERS = Object.values(InternetBankingProvider).map((p) => ({
  value: p,
  label: p,
}));

const PAYMENT_METHODS = Object.values(PaymentType).map((t) => ({
  value: t,
  label: t.replace("_", " "),
}));

interface IExpenseFormProps {
  projectSlug: string;
  expense?: any;
  handleCloseModal: () => void;
}

export function ExpenseForm({
  projectSlug,
  expense,
  handleCloseModal,
}: IExpenseFormProps) {
  const t = useTranslations("projects.commercial.expenses.form");
  const tCommon = useTranslations("common");
  const tActions = useTranslations("common.actions");
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<ExpenseCategorySimple[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: expense?.description ?? "",
      amount: expense ? Number(expense.amount) : 0,
      dueDate: expense ? new Date(expense.dueDate) : new Date(),
      internetBankingProvider:
        (expense?.internetBankingProvider as InternetBankingProvider) ?? "CORA",
      paymentType: (expense?.paymentType as PaymentType) ?? "PIX",
      status: (expense?.status as ExpenseStatus) ?? "PENDING",
      invoiceNumber: expense?.invoiceNumber ?? "",
      receiptLink: expense?.receiptLink ?? "",
      expenseCategoryId: expense?.expenseCategoryId ?? undefined,
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      try {
        const result = await listExpenseCategoryAction();
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          toast.error(t("loadCategoriesError"));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const onSubmit = (data: ExpenseFormData) => {
    startTransition(async () => {
      const result = expense
        ? await updateExpenseAction(expense.id, projectSlug, data)
        : await createExpenseAction(projectSlug, data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* --- Coluna da Esquerda --- */}
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="description"
              label={t("description")}
              placeholder={t("descriptionPlaceholder")}
              disabled={isPending}
            />

            <FormSelect
              control={form.control}
              name="expenseCategoryId"
              label={t("category")}
              placeholder={
                isLoadingCategories ? tCommon("loading") : tCommon("select")
              }
              disabled={isPending || isLoadingCategories}
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormNumberInput
                control={form.control}
                name="amount"
                label={t("amount")}
                placeholder="0.00"
                min={0}
                step={0.01}
                disabled={isPending}
                // Se o seu FormNumberInput não suportar icon, remova essa prop
                // ou use o FormInput com type="number" e icon={Wallet}
              />

              <FormDatePicker
                control={form.control}
                name="dueDate"
                label={t("dueDate")}
                placeholder={tActions("select")}
                disabled={isPending}
              />
            </div>
          </div>

          {/* --- Coluna da Direita --- */}
          <div className="space-y-4 lg:border-l lg:pl-6">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="internetBankingProvider"
                label={t("outboundAccount")}
                placeholder={t("bankPlaceholder")}
                disabled={isPending}
                options={BANK_PROVIDERS}
              />

              <FormSelect
                control={form.control}
                name="paymentType"
                label={t("paymentMethod")}
                placeholder={tActions("select")}
                disabled={isPending}
                options={PAYMENT_METHODS}
              />
            </div>

            <Separator className="my-2" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> {t("receiptsSection")}
              </h3>

              <FormInput
                control={form.control}
                name="invoiceNumber"
                label={t("invoiceNumber")}
                placeholder={t("invoiceNumberPlaceholder")}
                disabled={isPending}
              />

              <FormInput
                control={form.control}
                name="receiptLink"
                type="url"
                label={t("receiptLink")}
                placeholder={t("receiptLinkPlaceholder")}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCloseModal}
            disabled={isPending}
          >
            {tActions("cancel")}
          </Button>
          <Button type="submit" disabled={isPending} variant="destructive">
            {isPending
              ? tCommon("processing")
              : expense
                ? t("update")
                : t("register")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
