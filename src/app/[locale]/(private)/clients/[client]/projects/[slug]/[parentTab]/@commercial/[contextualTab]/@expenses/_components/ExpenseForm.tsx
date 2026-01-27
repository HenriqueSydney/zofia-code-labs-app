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
          toast.error("Não foi possível carregar as categorias.");
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
              label="Descrição da Despesa"
              placeholder="Ex: Servidor AWS, Aluguel..."
              disabled={isPending}
            />

            <FormSelect
              control={form.control}
              name="expenseCategoryId"
              label="Categoria"
              placeholder={
                isLoadingCategories ? "Carregando..." : "Selecione..."
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
                label="Valor (R$)"
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
                label="Vencimento"
                placeholder="Selecione"
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
                label="Conta de Saída"
                placeholder="Selecione o banco"
                disabled={isPending}
                options={BANK_PROVIDERS}
              />

              <FormSelect
                control={form.control}
                name="paymentType"
                label="Meio de Pagamento"
                placeholder="Selecione"
                disabled={isPending}
                options={PAYMENT_METHODS}
              />
            </div>

            <Separator className="my-2" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> Comprovantes e Fiscal
              </h3>

              <FormInput
                control={form.control}
                name="invoiceNumber"
                label="Número da Nota (NF)"
                placeholder="Ex: 000.456.789"
                disabled={isPending}
              />

              <FormInput
                control={form.control}
                name="receiptLink"
                type="url"
                label="Link do Comprovante"
                placeholder="https://..."
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
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} variant="destructive">
            {isPending
              ? "Processando..."
              : expense
                ? "Atualizar Despesa"
                : "Registrar Despesa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
