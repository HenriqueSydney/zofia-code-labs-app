import { v } from "@/schemas/validationMessages";
import {
  backlogPriorityArray,
  backlogStatusArray,
} from "@/mappers/BacklogMappers";
import { z } from "zod";

export const listBacklogItemsSchema = z.object({
  projectId: z.cuid(v.invalidProjectId),

  page: z.coerce
    .number()
    .min(1, v.pageMin)
    .default(1)
    .optional(),

  numberPerPage: z.coerce
    .number()
    .min(1)
    .max(100, v.pageMax)
    .default(20)
    .optional(),

  status: z.enum([...backlogStatusArray, "ALL"]).optional(),
  priority: z.enum([...backlogPriorityArray, "ALL"]).optional(),
  query: z.string().optional(),
});

export type ListBacklogItemsInput = z.infer<typeof listBacklogItemsSchema>;
