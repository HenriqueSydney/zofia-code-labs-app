import { v } from "@/schemas/validationMessages";
import { ContractStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export const contractStatus: ContractStatus[] = [
  "CANCELLED",
  "DRAFT",
  "SIGNED",
  "REVIEW",
  "SENT",
];

export const changeContractStatusSchema = z.object({
  contractId: z.cuid(),
  contractStatus: z.enum(contractStatus, {
    error: v.invalidProposalStatus,
  }),
});

export type ChangeContractStatusSchema = z.infer<
  typeof changeContractStatusSchema
>;
