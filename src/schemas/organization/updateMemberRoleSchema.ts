import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  memberId: z.cuid(v.invalidMemberId),
  customRoleId: z.union([
    z.cuid(v.invalidRoleId),
    z.enum(["admin", "member", "viewer"], {
      error: v.invalidRoleId,
    }),
  ]),
});

export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;
