import z from "zod";

export const removeProjectNoteSchema = z.object({
  id: z.cuid(),
});

export type RemoveProjectNoteSchemaValues = z.infer<
  typeof removeProjectNoteSchema
>;
