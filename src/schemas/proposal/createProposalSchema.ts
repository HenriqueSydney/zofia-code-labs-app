import { v } from "@/schemas/validationMessages";
import { DiscountType } from "@/generated/prisma/enums";
import { z } from "zod";

export const discoutTypes: DiscountType[] = ["FIXED", "PERCENTAGE"];

export const createProposalSchema = z.object({
  projectId: z.cuid(),
  downPaymentPercentage: z
    .number({
      error: v.entryPercentageRequired,
    })
    .positive({ error: v.entryPercentagePositive })
    .max(100, { error: v.downPaymentMax }),
  documents: z
    .custom<File>((val) => val instanceof File, v.invalidFile)
    .nullable()
    .optional(),
  validUntil: z.date().min(new Date(), {
    error: v.validUntilFuture,
  }),
  paymentGatewayId: z.string().optional(),
  paymentMethod: z.string().nullable().optional(),
  items: z.array(
    z.object({
      serviceTypeId: z.cuid(),
      discountType: z.enum(discoutTypes),
      discount: z.coerce.number().nonnegative().min(0),
    }),
  ),
});

export type CreateProposalType = z.infer<typeof createProposalSchema>;
