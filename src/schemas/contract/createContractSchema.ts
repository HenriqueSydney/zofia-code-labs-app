import { z } from "zod";

export const createContractSchema = z.object({
  documentTemplateId: z.cuid(),
  projectId: z.cuid(),
  documents: z
    .custom<File>((val) => val instanceof File, "Arquivo inválido")
    .nullable()
    .optional(),
});

export type CreateContractType = z.infer<typeof createContractSchema>;
