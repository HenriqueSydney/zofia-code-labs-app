import { ClientEmployeeRole } from "@/generated/prisma/enums";

export const clientEmployeeRoleKeys = {
  ADMIN: "ADMIN",
  USER: "USER",
  VIEWER: "VIEWER",
} as const satisfies Record<ClientEmployeeRole, string>;

export type ClientEmployeeRoleKey =
  (typeof clientEmployeeRoleKeys)[ClientEmployeeRole];

export function getClientEmployeeRoleLabel(
  role: ClientEmployeeRole,
  t: (key: ClientEmployeeRoleKey) => string,
): string {
  return t(clientEmployeeRoleKeys[role]);
}
