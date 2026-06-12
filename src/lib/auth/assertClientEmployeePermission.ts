import { ForbiddenError } from "@/errors";
import {
  ClientEmployeeRole,
  ClientEmployeeStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ClientPortalAction =
  | "READ"
  | "UPLOAD_DOCUMENT"
  | "RESPOND_BLOCKER"
  | "MANAGE_TEAM";

const ROLE_PERMISSIONS: Record<
  ClientEmployeeRole,
  Set<ClientPortalAction>
> = {
  ADMIN: new Set([
    "READ",
    "UPLOAD_DOCUMENT",
    "RESPOND_BLOCKER",
    "MANAGE_TEAM",
  ]),
  USER: new Set(["READ", "UPLOAD_DOCUMENT", "RESPOND_BLOCKER"]),
  VIEWER: new Set(["READ"]),
};

export async function getClientEmployeeMembership(
  userId: string,
  clientId: string,
) {
  return prisma.clientEmployees.findFirst({
    where: {
      userId,
      clientId,
      deletedAt: null,
      status: ClientEmployeeStatus.ACTIVE,
    },
  });
}

export async function assertClientEmployeePermission(
  userId: string,
  clientId: string,
  action: ClientPortalAction,
): Promise<{ permissionRole: ClientEmployeeRole }> {
  const membership = await getClientEmployeeMembership(userId, clientId);

  if (!membership) {
    throw new ForbiddenError("Você não tem acesso a este cliente.");
  }

  const allowed = ROLE_PERMISSIONS[membership.permissionRole];

  if (!allowed.has(action)) {
    throw new ForbiddenError("Você não tem permissão para esta ação.");
  }

  return { permissionRole: membership.permissionRole };
}

export async function assertClientSlugAccess(
  userId: string,
  clientSlug: string,
): Promise<{ clientId: string; permissionRole: ClientEmployeeRole }> {
  const membership = await prisma.clientEmployees.findFirst({
    where: {
      userId,
      deletedAt: null,
      status: ClientEmployeeStatus.ACTIVE,
      client: { slug: clientSlug, deletedAt: null },
    },
    include: { client: { select: { id: true } } },
  });

  if (!membership) {
    throw new ForbiddenError("Você não tem acesso a este cliente.");
  }

  return {
    clientId: membership.client.id,
    permissionRole: membership.permissionRole,
  };
}
