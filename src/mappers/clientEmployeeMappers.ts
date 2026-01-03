import { ClientEmployeeRole } from "@/generated/prisma/enums";

export const ClientEmployeeRoleMapper: Record<ClientEmployeeRole, string> = {
  USER: "Usuário (Padrão)",
  ADMIN: "Administrador",
  VIEWER: "Visualizador",
} as const;
