import { DiscountType } from "@/generated/prisma/enums";
import { z } from "zod";

export const discoutTypes: DiscountType[] = ["FIXED", "PERCENTAGE"];

export const createProposalSchema = z.object({
  documentTemplateId: z.cuid().nullable(),
  projectId: z.cuid(),
  documents: z
    .custom<File>((val) => val instanceof File, "Arquivo inválido")
    .nullable()
    .optional(),
  validUntil: z.date().min(new Date(), {
    error: "Validade da proposta deve ser igual ou maior que hoje.",
  }),
  items: z.array(
    z.object({
      serviceTypeId: z.cuid(),
      discountType: z.enum(discoutTypes),
      discount: z.coerce.number().nonnegative().min(0),
    })
  ),
});

export type CreateProposalType = z.infer<typeof createProposalSchema>;
