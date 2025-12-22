import { z } from "zod";

export const updateContractTemplateSchema = z.object({
  contractId: z.cuid(),
  content: z.any(),
});

export type UpdateContractTemplateSchema = z.infer<
  typeof updateContractTemplateSchema
>;
