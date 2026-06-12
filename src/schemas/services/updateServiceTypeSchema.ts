import { v } from "@/schemas/validationMessages";
import { z } from "zod";
import { createServiceTypeSchema } from "./createServiceTypeSchema";

// Reaproveitamos o schema de criação, adicionando o ID
export const updateServiceTypeSchema = createServiceTypeSchema.extend({
  id: z.cuid({ message: v.serviceIdInvalid }),
});

export type UpdateServiceTypeSchema = z.infer<typeof updateServiceTypeSchema>;
