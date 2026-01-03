import { expenseNatureMapper } from "@/mappers/expenseNatureMapper";
import { z } from "zod";

const natureArray = Object.keys(expenseNatureMapper);

const natureZodEnum = z.enum(natureArray);

/**
 * Schema principal para criação e edição de categorias de despesa.
 */
export const expenseCategorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome da categoria é obrigatório.")
    .max(100, "O nome deve ter no máximo 100 caracteres.")
    .trim(),

  description: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")), // Permite string vazia do formulário
  nature: natureZodEnum,
});

/**
 * Inferência do tipo para uso no React Hook Form
 */
export type ExpenseCategorySchema = z.infer<typeof expenseCategorySchema>;

export const updateExpenseCategorySchema = expenseCategorySchema.extend({
  id: z.cuid("ID de categoria inválido."),
});

export type UpdateExpenseCategorySchema = z.infer<
  typeof updateExpenseCategorySchema
>;
