import z from "zod";

export const createServiceCategorySchema = z.object({
  organizationId: z.cuid().optional(),
  name: z
    .string({ error: "O nome do serviço é obrigatório." })
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(150, "O nome deve ter no máximo 150 caracteres."),
  description: z.string().optional().nullable(),
  taxCode: z
    .string({
      error: "O código do imposto para nota fiscal deve ser um valor válido.",
    })
    .optional(),
});

export type CreateServiceCategorySchema = z.infer<
  typeof createServiceCategorySchema
>;
