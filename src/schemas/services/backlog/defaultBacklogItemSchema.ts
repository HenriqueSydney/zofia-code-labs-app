import { v } from "@/schemas/validationMessages";
import { backlogPriorityArray } from "@/mappers/BacklogMappers";
import { z } from "zod";

export const DefaultBacklogPriorityEnum = z.enum(backlogPriorityArray);

export const defaultbacklogItemSchema = z.object({
  id: z.cuid().optional(),

  title: z
    .string({ error: v.titleRequired })
    .min(3, v.titleMinLength)
    .max(255, v.titleMaxLength),

  description: z
    .string({ error: v.descriptionRequired })
    .min(1, v.descriptionMinLength),

  serviceTypeId: z.cuid(v.serviceIdInvalid),

  points: z
    .number({ error: v.pointsMustBeNumber })
    .int(v.pointsMustBeInteger)
    .min(0, v.pointsNonNegative)
    .default(0),

  priority: DefaultBacklogPriorityEnum.default("LOW"),
});

export type DefaultBacklogItemSchema = z.infer<typeof defaultbacklogItemSchema>;
