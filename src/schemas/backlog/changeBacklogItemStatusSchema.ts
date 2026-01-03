import { z } from "zod";

export const changeBacklogItemStatusSchema = z.object({
  id: z.cuid("ID do backlog inválido."),

  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELED"], {
    error: "Status fornecido é inválido.",
  }),
});

export type ChangeBacklogItemStatusInput = z.infer<
  typeof changeBacklogItemStatusSchema
>;
