import { v } from "@/schemas/validationMessages";
import { backlogStatusArray } from "@/mappers/BacklogMappers";
import { z } from "zod";

export const reorderBacklogItemSchema = z.object({
  id: z.cuid(v.invalidId),
  newPositionIndex: z.number(v.invalidOrder),
  allSortedIds: z.array(z.cuid()),
  status: z.enum(backlogStatusArray).optional(),
});

export type ReorderBacklogItemType = z.infer<typeof reorderBacklogItemSchema>;
