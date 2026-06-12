import { ForbiddenError } from "@/errors";
import { MemberRole, Role } from "@/generated/prisma/enums";
import { UserContext } from "./types";

const STAFF_MEMBER_ROLES: MemberRole[] = [
  MemberRole.TENANT_MEMBER,
  MemberRole.TENANT_ADMIN,
];

export function assertOrganizationStaffMember(user: UserContext): void {
  if (user.role === Role.OWNER) {
    return;
  }

  if (user.memberRole === MemberRole.TENANT_OBSERVER) {
    throw new ForbiddenError(
      "Usuários do portal do cliente não podem acessar a organização.",
    );
  }

  if (!user.memberRole || !STAFF_MEMBER_ROLES.includes(user.memberRole)) {
    throw new ForbiddenError("Acesso negado: vínculo de membro inválido.");
  }
}
