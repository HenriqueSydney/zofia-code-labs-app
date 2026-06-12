import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const changeBacklogItemStatusSchema = z.object({
  id: z.cuid(v.invalidBacklogId),

  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELED"], {
    error: v.invalidBacklogStatus,
  }),
});

export type ChangeBacklogItemStatusInput = z.infer<
  typeof changeBacklogItemStatusSchema
>;
