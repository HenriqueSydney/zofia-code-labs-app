import { z } from "zod";

export const getDefaultBacklogItemSchema = z.object({
  id: z.cuid("ID inválido."),
});

export type GetDefaultBacklogItemInput = z.infer<typeof getDefaultBacklogItemSchema>;
