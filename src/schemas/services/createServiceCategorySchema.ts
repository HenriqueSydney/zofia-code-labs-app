import { v } from "@/schemas/validationMessages";
import z from "zod";

export const createServiceCategorySchema = z.object({
  organizationId: z.cuid().optional(),
  name: z
    .string({ error: v.serviceNameRequired })
    .min(3, v.nameMinLength)
    .max(150, v.nameMaxLength),
  description: z.string().optional().nullable(),
  taxCode: z
    .string({
      error: v.taxCodeInvalid,
    })
    .optional(),
});

export type CreateServiceCategorySchema = z.infer<
  typeof createServiceCategorySchema
>;
