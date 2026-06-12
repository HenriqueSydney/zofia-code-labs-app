import { v } from "@/schemas/validationMessages";
import { ProposalStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export const proposalStatus: ProposalStatus[] = [
  "ACCEPTED",
  "APPROVED",
  "DRAFT",
  "REJECTED",
  "REVIEW",
  "SENT",
  "CANCELLED",
];

export const changeProposalStatusSchema = z.object({
  proposalId: z.cuid(),
  proposalStatus: z.enum(proposalStatus, {
    error: v.invalidProposalStatus,
  }),
});

export type ChangeProposalStatusSchema = z.infer<
  typeof changeProposalStatusSchema
>;
