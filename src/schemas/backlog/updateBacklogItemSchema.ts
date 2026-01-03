import { z } from "zod";
import { backlogItemSchema } from "./backlogItemSchema";

// 2. Schema de Validação backlogItemSchema
export const updateBacklogItemSchema = backlogItemSchema
  .partial()
  .required({ id: true });
// 3. Exportando o Type inferido
export type UpdateBacklogItemSchema = z.infer<typeof updateBacklogItemSchema>;
