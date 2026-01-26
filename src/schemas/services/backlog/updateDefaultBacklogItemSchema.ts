import { z } from "zod";
import { defaultbacklogItemSchema } from "./defaultBacklogItemSchema";

// 2. Schema de Validação defaultbacklogItemSchema
export const updateDefaultBacklogItemSchema = defaultbacklogItemSchema
  .partial()
  .required({ id: true });
// 3. Exportando o Type inferido
export type UpdateDefaultBacklogItemSchema = z.infer<
  typeof updateDefaultBacklogItemSchema
>;
