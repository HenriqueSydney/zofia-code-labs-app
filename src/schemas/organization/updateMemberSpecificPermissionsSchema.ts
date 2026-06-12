import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const updateMemberSpecificPermissionsSchema = z.object({
  memberId: z.cuid(v.invalidMemberId),
  permissions: z.array(z.string()),
});

export type UpdateMemberSpecificPermissionsSchema = z.infer<
  typeof updateMemberSpecificPermissionsSchema
>;
