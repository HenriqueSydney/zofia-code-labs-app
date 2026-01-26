
import { backlogPriorityArray } from "@/mappers/BacklogMappers";
import { z } from "zod";

export const listDefaultBacklogItemsSchema = z.object({
  projectId: z.cuid("ID do projeto inválido."),

  page: z.coerce
    .number()
    .min(1, "A página deve ser no mínimo 1.")
    .default(1)
    .optional(),

  numberPerPage: z.coerce
    .number()
    .min(1)
    .max(100, "O limite máximo por página é 100.")
    .default(20)
    .optional(),

  priority: z.enum([...backlogPriorityArray, "ALL"]).optional(),
  query: z.string().optional(),
});

export type ListDefaultBacklogItemsInput = z.infer<typeof listDefaultBacklogItemsSchema>;
