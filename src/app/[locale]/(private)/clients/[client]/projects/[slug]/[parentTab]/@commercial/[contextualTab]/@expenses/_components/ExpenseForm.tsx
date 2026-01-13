"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarIcon, FileText, Landmark, Wallet, Tag } from "lucide-react";

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
  ExpenseStatus,
  FinancialStatus,
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

// Tipagem simples para a categoria baseada no seu Prisma Model
interface ExpenseCategorySimple {
  id: string;
  name: string;
}

const BANK_PROVIDERS = Object.values(
  InternetBankingProvider
) as InternetBankingProvider[];
const PAYMENT_METHODS = Object.values(PaymentType) as PaymentType[];

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

  // Estado para armazenar as categorias
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

      // Campo de Categoria (inicializa com o valor existente ou undefined)
      expenseCategoryId: expense?.expenseCategoryId ?? undefined,
    },
  });

  // Busca as categorias ao montar o componente
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
          {/* Coluna da Esquerda */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Despesa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Servidor AWS, Aluguel..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- NOVO CAMPO DE CATEGORIA --- */}
            <FormField
              control={form.control}
              name="expenseCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Categoria
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    disabled={isPending || isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Carregando..."
                              : "Selecione uma categoria"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-9"
                          disabled={isPending}
                          {...fieldProps}
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

          {/* Coluna da Direita */}
          <div className="space-y-4 lg:border-l lg:pl-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="internetBankingProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Landmark className="w-4 h-4" /> Conta de Saída
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
                    <FormLabel>Meio de Pagamento</FormLabel>
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
                <FileText className="w-4 h-4" /> Comprovantes e Fiscal
              </h3>

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase">
                      Número da Nota (Fornecedor)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 000.456.789"
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
                name="receiptLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] uppercase">
                      Link do Comprovante/PDF
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
