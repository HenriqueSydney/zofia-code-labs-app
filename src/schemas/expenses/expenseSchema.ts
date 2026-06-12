import { v } from "@/schemas/validationMessages";
import { z } from "zod";

const InternetBankingProviderSchema = z.enum([
  "CORA",
  "INTER",
  "BB",
  "ITAU",
  "CAIXA",
  "SANTANDER",
  "BRADESCO",
  "NUBANK",
  "C6",
  "BTG",
  "ORIGINAL",
  "NEON",
  "SAFRA",
  "SICOOB",
  "SICREDI",
  "PAGSEGURO",
  "MERCADO_PAGO",
  "OTHER",
  "PAYPAL",
  "STRIPE",
]);

const PaymentTypeSchema = z.enum([
  "PIX",
  "BOLETO",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "TRANSFER",
  "CASH",
  "OTHER",
]);

export const ExpenseStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "CANCELED",
  "SCHEDULED",
]);

export const expenseSchema = z.object({
  description: z
    .string({ error: v.descriptionRequired })
    .min(3, v.descriptionMinLength),

  supplier: z.string().optional().nullable(),

  expenseCategoryId: z.cuid(v.invalidCategoryId),

  amount: z.coerce
    .number({ error: v.priceInvalid })
    .positive(v.amountMustBePositive),

  dueDate: z.coerce.date({
    error: v.dueDateRequired,
  }),

  internetBankingProvider: InternetBankingProviderSchema.default("CORA"),

  paymentType: PaymentTypeSchema.default("PIX"),

  status: ExpenseStatusSchema.default("PENDING"),

  invoiceNumber: z.string().optional(),

  receiptLink: z.url(v.invalidUrl).optional().or(z.literal("")),

  meta: z.record(z.string(), z.any()).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const updateExpenseSchema = expenseSchema.partial();
export type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;
