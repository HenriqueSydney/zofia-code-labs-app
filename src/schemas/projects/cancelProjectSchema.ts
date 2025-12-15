import z from "zod";

export const cancelProjectSchema = z.object({
  id: z.cuid(),
});
