import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  memberId: z.cuid("O identificador do usuário deve ser válido"),
  customRoleId: z.union([
    z.cuid("O identificador do perfil de acesso deve ser válido"),
    z.enum(["admin", "member", "viewer"], {
      error: "O identificador do perfil de acesso deve ser válido",
    }),
  ]),
});

export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;
