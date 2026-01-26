import { backlogPriorityArray } from "@/mappers/BacklogMappers";
import { z } from "zod";

export const DefaultBacklogPriorityEnum = z.enum(backlogPriorityArray);

// 2. Schema de Validação
export const defaultbacklogItemSchema = z.object({
  // ID é opcional pois na criação não existe, mas na edição é necessário
  id: z.cuid().optional(),

  title: z
    .string({ error: "O título é obrigatório." })
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(255, "O título deve ter no máximo 255 caracteres."),

  description: z
    .string({ error: "A descrição é obrigatória." })
    .min(1, "A descrição não pode ser vazia."),

  serviceTypeId: z.cuid("ID do serviço inválido."),

  points: z
    .number({ error: "Os pontos devem ser um número." })
    .int("Os pontos devem ser um número inteiro.")
    .min(0, "Os pontos não podem ser negativos.")
    .default(0),

  priority: DefaultBacklogPriorityEnum.default("LOW"),
});

// 3. Exportando o Type inferido
export type DefaultBacklogItemSchema = z.infer<typeof defaultbacklogItemSchema>;
