import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().min(3, v.nameMinLength),
  description: z.string().min(10, v.projectDescriptionMin),
  clientId: z.string({ message: v.selectClient }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  estimatedStartDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  totalBudget: z.number().min(0).optional(),
  tags: z.array(z.string(), { error: v.tagsListExpected }).optional(),
  documents: z
    .array(z.custom<File>((val) => val instanceof File, v.invalidFile))
    .optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
