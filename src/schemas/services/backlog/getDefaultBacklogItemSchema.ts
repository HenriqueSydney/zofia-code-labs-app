import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const getDefaultBacklogItemSchema = z.object({
  id: z.cuid(v.invalidId),
});

export type GetDefaultBacklogItemInput = z.infer<typeof getDefaultBacklogItemSchema>;
