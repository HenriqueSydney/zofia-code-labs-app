"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import {
  invoiceSchema,
  InvoiceFormData,
} from "@/schemas/financial/invoiceSchema";
import { createInvoiceAction } from "@/actions/financial/createInvoiceAction";
import { updateInvoiceAction } from "@/actions/financial/updateInvoiceAction";
import {
  FinancialStatus,
  InternetBankingProvider,
  PaymentType,
} from "@/generated/prisma/enums";
import { FormInput } from "@/components/form/FormInput";
import { FormNumberInput } from "@/components/form/FormNumberInput";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { FormSelect } from "@/components/form/FormSelect";
import { useTranslations } from "next-intl";

// Mapeamento de Opções
const BANK_OPTIONS = Object.values(InternetBankingProvider).map((p) => ({
  value: p,
  label: p,
}));

const PAYMENT_OPTIONS = Object.values(PaymentType).map((t) => ({
  value: t,
  label: t.replace("_", " "),
}));

interface IInvoiceFormProps {
  projectSlug: string;
  invoice?: any;
  handleCloseModal: () => void;
}

export function InvoiceForm({
  projectSlug,
  invoice,
  handleCloseModal,
}: IInvoiceFormProps) {
  const t = useTranslations("projects.commercial.invoices.form");
  const tCommon = useTranslations("common.actions");
  const tTransition = useTranslations("projects.transitions.common");
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      description: invoice?.description ?? "",
      amount: invoice ? Number(invoice.amount) : 0,
      dueDate: invoice ? new Date(invoice.dueDate) : new Date(),
      internetBankingProvider:
        (invoice?.internetBankingProvider as InternetBankingProvider) ?? "CORA",
      paymentType: (invoice?.paymentType as PaymentType) ?? "PIX",
      status: (invoice?.status as FinancialStatus) ?? "PENDING",
      nfseNumber: invoice?.nfseNumber ?? "",
      nfseLink: invoice?.nfseLink ?? "",
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    startTransition(async () => {
      const result = invoice
        ? await updateInvoiceAction(invoice.id, projectSlug, data)
        : await createInvoiceAction(projectSlug, data);

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

            <div className="grid grid-cols-2 gap-4">
              <FormNumberInput
                control={form.control}
                name="amount"
                label={t("amount")}
                placeholder="0.00"
                min={0}
                step={0.01}
                disabled={isPending}
              />

              <FormDatePicker
                control={form.control}
                name="dueDate"
                label={t("dueDate")}
                placeholder={tCommon("select")}
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
                label={t("bank")}
                placeholder={tCommon("select")}
                options={BANK_OPTIONS}
                disabled={isPending}
                // Dica: Se quiser ícone no label, pode passar no prop label ou usar o componente original
              />

              <FormSelect
                control={form.control}
                name="paymentType"
                label={t("paymentType")}
                placeholder={tCommon("select")}
                options={PAYMENT_OPTIONS}
                disabled={isPending}
              />
            </div>

            <Separator className="my-2" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> {t("fiscalSection")}
              </h3>

              <FormInput
                control={form.control}
                name="nfseNumber"
                label={t("nfeNumber")}
                placeholder="Ex: 2024001"
                disabled={isPending}
              />

              <FormInput
                control={form.control}
                name="nfseLink"
                label={t("nfseLink")}
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
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? tTransition("processing") : invoice ? t("update") : t("generate")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
