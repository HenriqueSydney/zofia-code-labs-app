import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const createContractSchema = z.object({
  projectId: z.cuid(),
  documents: z
    .custom<File>((val) => val instanceof File, v.invalidFile)
    .nullable()
    .optional(),
});

export type CreateContractType = z.infer<typeof createContractSchema>;
