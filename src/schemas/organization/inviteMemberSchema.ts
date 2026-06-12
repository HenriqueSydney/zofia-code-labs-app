import { v } from "@/schemas/validationMessages";
import { z } from "zod";

export const inviteMemberSchema = z.object({
  organizationId: z.string().min(1, v.required),
  name: z.string().min(3, v.nameMinLength),
  email: z.email(v.invalidEmail),
  roleId: z.string().min(1, v.selectionRequired),
});

export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>;
