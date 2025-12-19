import { z } from "zod";


export const updateProposalTemplateSchema = z.object({
  proposalId: z.cuid(),
  content: z.any(),
});

export type UpdateProposalTemplateSchema = z.infer<
  typeof updateProposalTemplateSchema
>;
