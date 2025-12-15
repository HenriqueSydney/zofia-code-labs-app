import z from "zod";
import { projectFormSchema } from "./createProjectSchema";

export const updateProjectSchema = projectFormSchema.partial().extend({
  id: z.cuid(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
