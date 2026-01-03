import { z } from "zod";

export const getBacklogItemSchema = z.object({
  id: z.cuid("ID inválido."),
});

export type GetBacklogItemInput = z.infer<typeof getBacklogItemSchema>;
