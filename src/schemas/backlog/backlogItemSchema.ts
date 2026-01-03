import {
  backlogPriorityArray,
  backlogStatusArray,
} from "@/mappers/BacklogMappers";
import { z } from "zod";

export const BacklogStatusEnum = z.enum(backlogStatusArray);

export const BacklogPriorityEnum = z.enum(backlogPriorityArray);

// 2. Schema de Validação
export const backlogItemSchema = z.object({
  // ID é opcional pois na criação não existe, mas na edição é necessário
  id: z.cuid().optional(),

  title: z
    .string({ error: "O título é obrigatório." })
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(255, "O título deve ter no máximo 255 caracteres."),

  description: z
    .string({ error: "A descrição é obrigatória." })
    .min(1, "A descrição não pode ser vazia."),

  status: BacklogStatusEnum.default("TODO"),

  projectId: z.cuid("ID do projeto inválido."),

  sprintId: z.cuid("ID da sprint inválido.").optional().nullable(),

  points: z
    .number({ error: "Os pontos devem ser um número." })
    .int("Os pontos devem ser um número inteiro.")
    .min(0, "Os pontos não podem ser negativos.")
    .default(0),

  priority: BacklogPriorityEnum.default("LOW"),

  assigneeId: z
    .cuid("ID do responsável inválido.") // Assume que o ID do User é CUID/UUID
    .optional()
    .nullable(),

  externalLink: z
    .url("Deve ser uma URL válida (ex: https://jira...).")
    .optional()
    .nullable()
    .or(z.literal("")), // Permite string vazia para limpar o campo
});

// 3. Exportando o Type inferido
export type BacklogItemSchema = z.infer<typeof backlogItemSchema>;
