import { v } from "@/schemas/validationMessages";
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
    .min(1, v.categoryNameRequired)
    .max(100, v.nameMaxLength)
    .trim(),

  description: z
    .string()
    .max(500, v.descriptionMaxLength)
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
  id: z.cuid(v.invalidCategoryId),
});

export type UpdateExpenseCategorySchema = z.infer<
  typeof updateExpenseCategorySchema
>;
