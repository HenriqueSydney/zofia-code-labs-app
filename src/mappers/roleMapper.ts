import { MemberRole } from "@/generated/prisma/enums";

export const roleMapper: Record<MemberRole, string> = {
  TENANT_ADMIN: "Administrador",
  TENANT_MEMBER: "Membro",
  TENANT_OBSERVER: "Visualizador",
};
