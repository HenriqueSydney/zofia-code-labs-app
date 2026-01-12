"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarIcon, DollarSign, FileText, Landmark } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";
import { date } from "@/lib/dayjs";
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

// --- Mappers para evitar o uso do Enum direto no JSX e garantir tipagem ---
const BANK_PROVIDERS = Object.values(
  InternetBankingProvider
) as InternetBankingProvider[];
const PAYMENT_METHODS = Object.values(PaymentType) as PaymentType[];

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
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Fatura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Desenvolvimento Web - Março"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field: { value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-9"
                          disabled={isPending}
                          {...fieldProps}
                          // Cast explícito para satisfazer InputHTMLAttributes
                          value={(value as number) ?? 0}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isPending}
                          >
                            {/* Cast explícito para Date para o date() e Calendar */}
                            {field.value ? (
                              date(field.value as Date).format("DD/MM/YYYY")
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value as Date | undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 lg:border-l lg:pl-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="internetBankingProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Landmark className="w-4 h-4" /> Banco
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANK_PROVIDERS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Recebimento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Dados Fiscais (Opcional)
              </h3>

              <FormField
                control={form.control}
                name="nfseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase">
                      Número da NF-e
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 2024001"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nfseLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase">
                      Link do PDF da Nota
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCloseModal}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Processando..."
              : invoice
              ? "Atualizar Fatura"
              : "Gerar Fatura"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
