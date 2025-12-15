import z from "zod";

export const createTemplateSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  type: z.enum(["CONTRACT", "PROPOSAL", "DELIVERY_TERM", "OTHER"]),
  content: z.any(),
});

export type CreateTemplateSchemaType = z.infer<typeof createTemplateSchema>;
