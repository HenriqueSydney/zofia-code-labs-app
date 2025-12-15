import z from "zod";

export const createServiceTypeSchema = z.object({
  organizationId: z.cuid().optional(),
  categoryId: z
    .string({ error: "A Categoria é obrigatória." })
    .min(1, "Selecione uma categoria."),
  name: z
    .string({ error: "O nome do serviço é obrigatório." })
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  description: z.string().optional().nullable(),
  basePrice: z
    .number({ error: "O preço deve ser um número válido." })
    .min(0, "O preço não pode ser negativo.")
    .optional(),
  active: z.boolean().default(true).optional(),
});

export type CreateServiceTypeSchema = z.infer<typeof createServiceTypeSchema>;
