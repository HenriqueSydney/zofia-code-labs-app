import { z } from "zod";

// Schema de validação
export const createProjectNoteSchema = z.object({
  content: z
    .string()
    .min(10, "A descrição do projeto deve ter ao menos 10 caracteres."),
});

export type CreateProjectNoteSchemaValues = z.infer<
  typeof createProjectNoteSchema
>;
