import { z } from "zod";

export const updateMemberSpecificPermissionsSchema = z.object({
  memberId: z.cuid("O identificador do usuário deve ser válido"),
  permissions: z.array(z.string()),
});

export type UpdateMemberSpecificPermissionsSchema = z.infer<
  typeof updateMemberSpecificPermissionsSchema
>;
