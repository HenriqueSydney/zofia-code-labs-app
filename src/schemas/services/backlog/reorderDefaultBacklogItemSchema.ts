import { z } from "zod";

export const reorderDefaultBacklogItemSchema = z.object({
  id: z.cuid("ID inválido."),
  newPositionIndex: z.number("Nova ordem inválida"),
  allSortedIds: z.array(z.cuid()),
});

export type ReorderDefaultBacklogItemType = z.infer<
  typeof reorderDefaultBacklogItemSchema
>;
