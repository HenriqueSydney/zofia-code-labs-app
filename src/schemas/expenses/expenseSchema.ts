import { z } from "zod";

// Defina os Enums manualmente para validação ou importe do @prisma/client
// Estou replicando os valores padrão do Prisma para garantir a tipagem
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
    .string({ error: "A descrição é obrigatória." })
    .min(3, "A descrição deve ter pelo menos 3 caracteres."),

  // Opcionais (Inputs de texto vazio no React Hook Form geralmente vêm como string vazia ou undefined)
  supplier: z.string().optional().nullable(),

  // ATENÇÃO: Se o seu form não tem o select de categoria, isso deve ser opcional
  // Se for obrigatório no banco, você precisará adicionar o campo no InvoiceForm
  expenseCategoryId: z.cuid("Categoria inválida."),

  // Zod v3.20+ usa z.coerce para converter strings de inputs HTML automaticamente
  amount: z.coerce
    .number({ error: "O valor deve ser um número válido." })
    .positive("O valor deve ser positivo."),

  // Renomeado de 'date' para 'dueDate' para bater com o name="dueDate" do form
  dueDate: z.coerce.date({
    error: "A data de vencimento é obrigatória.",
  }),

  // Campos que faltavam no seu schema original:
  internetBankingProvider: InternetBankingProviderSchema.default("CORA"),

  paymentType: PaymentTypeSchema.default("PIX"),

  status: ExpenseStatusSchema.default("PENDING"),

  // Dados da Nota Fiscal (Adicionados agora)
  // .or(z.literal('')) permite que o campo venha como string vazia sem dar erro de "invalid url"
  invoiceNumber: z.string().optional(),

  receiptLink: z.url("Insira uma URL válida").optional().or(z.literal("")),

  // Meta dados
  meta: z.record(z.string(), z.any()).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Schema parcial para atualizações
export const updateExpenseSchema = expenseSchema.partial();
export type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;
