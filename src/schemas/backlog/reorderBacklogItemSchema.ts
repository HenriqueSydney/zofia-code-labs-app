import { backlogStatusArray } from "@/mappers/BacklogMappers";
import { z } from "zod";

export const reorderBacklogItemSchema = z.object({
  id: z.cuid("ID inválido."),
  newPositionIndex: z.number("Nova ordem inválida"),
  allSortedIds: z.array(z.cuid()),
  status: z.enum(backlogStatusArray).optional(),
});

export type ReorderBacklogItemType = z.infer<typeof reorderBacklogItemSchema>;
