import { z } from "zod";
import { createProjectNoteSchema } from "./createProjectNoteSchema";

export const updateProjectNoteSchema = createProjectNoteSchema.extend({
  id: z.cuid(),
});

export type UpdateProjectNoteSchemaValues = z.infer<
  typeof updateProjectNoteSchema
>;
