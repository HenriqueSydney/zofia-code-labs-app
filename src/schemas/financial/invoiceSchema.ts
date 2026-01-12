import { FinancialStatus } from "@/generated/prisma/enums";
import { z } from "zod";

// Mappers para transformar os Enums em arrays literais para o Zod
const INTERNET_BANKING_PROVIDERS = [
  "CORA",
  "PAYPAL",
  "MERCADO_PAGO",
  "STRIPE",
] as const;
const PAYMENT_TYPES = ["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"] as const;
const FINANCIAL_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"] as const;

export const invoiceSchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(255),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  dueDate: z.coerce.date({
    error: "A data de vencimento é obrigatória",
  }),

  internetBankingProvider: z.enum(INTERNET_BANKING_PROVIDERS, {
    error: "Selecione um banco válido",
  }),

  paymentType: z.enum(PAYMENT_TYPES, {
    error: "Selecione um método de pagamento",
  }),

  status: z
    .enum(FINANCIAL_STATUSES)
    .optional()
    .default(FinancialStatus.PENDING),

  nfseNumber: z.string().optional().nullable(),
  nfseLink: z
    .url("Link da NF-e inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
