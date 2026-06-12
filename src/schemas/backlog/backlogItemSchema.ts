import { v } from "@/schemas/validationMessages";
import {
  backlogPriorityArray,
  backlogStatusArray,
} from "@/mappers/BacklogMappers";
import { z } from "zod";

export const BacklogStatusEnum = z.enum(backlogStatusArray);

export const BacklogPriorityEnum = z.enum(backlogPriorityArray);

export const backlogItemSchema = z.object({
  id: z.cuid().optional(),

  title: z
    .string({ error: v.titleRequired })
    .min(3, v.titleMinLength)
    .max(255, v.titleMaxLength),

  description: z
    .string({ error: v.descriptionRequired })
    .min(1, v.descriptionMinLength),

  status: BacklogStatusEnum.default("TODO"),

  projectId: z.cuid(v.invalidProjectId),

  sprintId: z.cuid(v.invalidSprintId).optional().nullable(),

  points: z
    .number({ error: v.pointsMustBeNumber })
    .int(v.pointsMustBeInteger)
    .min(0, v.pointsNonNegative)
    .default(0),

  priority: BacklogPriorityEnum.default("LOW"),

  assigneeId: z.cuid(v.responsibleIdInvalid).optional().nullable(),

  externalLink: z
    .url(v.jiraUrlInvalid)
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type BacklogItemSchema = z.infer<typeof backlogItemSchema>;
