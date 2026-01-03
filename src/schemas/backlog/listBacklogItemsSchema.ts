import {
  backlogPriorityArray,
  backlogStatusArray,
} from "@/mappers/BacklogMappers";
import { z } from "zod";

export const listBacklogItemsSchema = z.object({
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

  status: z.enum([...backlogStatusArray, "ALL"]).optional(),
  priority: z.enum([...backlogPriorityArray, "ALL"]).optional(),
  query: z.string().optional(),
});

export type ListBacklogItemsInput = z.infer<typeof listBacklogItemsSchema>;
