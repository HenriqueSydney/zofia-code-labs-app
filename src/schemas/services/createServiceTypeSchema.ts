import { v } from "@/schemas/validationMessages";
import z from "zod";

export const createServiceTypeSchema = z.object({
  organizationId: z.cuid().optional(),
  categoryId: z.string({ error: v.selectCategory }).min(1, v.selectCategory),
  name: z
    .string({ error: v.serviceNameRequired })
    .min(3, v.nameMinLength)
    .max(150, v.nameMaxLength),
  description: z.string().optional().nullable(),
  basePrice: z
    .number({ error: v.priceInvalid })
    .min(0, v.priceNonNegative)
    .optional(),
  active: z.boolean().default(true).optional(),
});

export type CreateServiceTypeSchema = z.infer<typeof createServiceTypeSchema>;
