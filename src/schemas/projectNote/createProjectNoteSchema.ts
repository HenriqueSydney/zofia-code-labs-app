import { v } from "@/schemas/validationMessages";
import { z } from "zod";

// Schema de validação
export const createProjectNoteSchema = z.object({
  content: z
    .string()
    .min(10, v.noteDescriptionMin),
});

export type CreateProjectNoteSchemaValues = z.infer<
  typeof createProjectNoteSchema
>;
