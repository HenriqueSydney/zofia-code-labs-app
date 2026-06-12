import { v } from "@/schemas/validationMessages";
import { z } from "zod";
import { createServiceCategorySchema } from "./createServiceCategorySchema";

// Reaproveitamos o schema de criação, adicionando o ID
export const updateServiceCategorySchema = createServiceCategorySchema.extend({
  id: z.cuid({ message: v.serviceIdInvalid }),
});

export type UpdateServiceCategorySchema = z.infer<
  typeof updateServiceCategorySchema
>;
