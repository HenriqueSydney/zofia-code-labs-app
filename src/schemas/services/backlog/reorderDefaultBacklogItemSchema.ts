import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const reorderDefaultBacklogItemSchema = z.object({
  id: z.cuid(v.invalidId),
  newPositionIndex: z.number(v.invalidOrder),
  allSortedIds: z.array(z.cuid()),
});

export type ReorderDefaultBacklogItemType = z.infer<
  typeof reorderDefaultBacklogItemSchema
>;
