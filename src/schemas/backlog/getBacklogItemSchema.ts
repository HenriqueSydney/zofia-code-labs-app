import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const getBacklogItemSchema = z.object({
  id: z.cuid(v.invalidId),
});

export type GetBacklogItemInput = z.infer<typeof getBacklogItemSchema>;
