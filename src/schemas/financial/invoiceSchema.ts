import { v } from "@/schemas/validationMessages";
import { FinancialStatus } from "@/generated/prisma/enums";
import { z } from "zod";

const INTERNET_BANKING_PROVIDERS = [
  "CORA",
  "PAYPAL",
  "MERCADO_PAGO",
  "STRIPE",
  "INTER",
] as const;
const PAYMENT_TYPES = ["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"] as const;
const FINANCIAL_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"] as const;

export type InvoiceFormStatus = (typeof FINANCIAL_STATUSES)[number];

export function toInvoiceFormStatus(
  status?: FinancialStatus | null,
): InvoiceFormStatus {
  if (status && (FINANCIAL_STATUSES as readonly string[]).includes(status)) {
    return status as InvoiceFormStatus;
  }

  return FinancialStatus.PENDING;
}

export const invoiceSchema = z.object({
  description: z.string().min(3, v.descriptionMinLength).max(255),
  amount: z.coerce.number().positive(v.amountPositive),
  dueDate: z.coerce.date({
    error: v.dueDateRequired,
  }),

  internetBankingProvider: z.enum(INTERNET_BANKING_PROVIDERS, {
    error: v.selectBank,
  }),

  paymentType: z.enum(PAYMENT_TYPES, {
    error: v.selectPaymentMethod,
  }),

  status: z
    .enum(FINANCIAL_STATUSES)
    .optional()
    .default(FinancialStatus.PENDING),

  nfseNumber: z.string().optional().nullable(),
  nfseLink: z
    .url(v.nfseLinkInvalid)
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
