import z from "zod";

export const integrationTypeSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  logo: z.string().optional().or(z.literal("")).nullable(),
  description: z.string(),
  externalDocsUrl: z
    .url("O link para documentação externa deve ser uma URL válida")
    .optional(),
  fieldsSchema: z.array(
    z.object({
      key: z.string().min(1, "Chave técnica"),
      label: z.string().min(1, "Rótulo amigável"),
      type: z.enum(["text", "password", "email", "url"]),
      required: z.boolean().default(true),
      isSecret: z.boolean().default(false), // Define se vai para o Infisical
    })
  ),
});

export const updateIntegrationTypeSchema = integrationTypeSchema
  .partial()
  .extend({
    id: z.cuid("ID inválido"),
  });

export type IntegrationTypeData = z.infer<typeof integrationTypeSchema>;
export type UpdateIntegrationTypeData = z.infer<
  typeof updateIntegrationTypeSchema
>;
