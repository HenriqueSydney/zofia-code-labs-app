import { Role } from "@/generated/prisma/enums";
import { UserContext } from "@/lib/auth/strategies/types";
import { PERMISSIONS, PermissionString } from "./permissions";

export const SYSTEM_WEBHOOK_USER_ID = "SYSTEM_WEBHOOK" as const;

export type SystemActorId = typeof SYSTEM_WEBHOOK_USER_ID;

export function isSystemActor(userId: string): userId is SystemActorId {
  return userId === SYSTEM_WEBHOOK_USER_ID;
}

function flattenPermissions(obj: Record<string, unknown>): PermissionString[] {
  const result: PermissionString[] = [];

  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      result.push(value as PermissionString);
    } else if (value && typeof value === "object") {
      result.push(...flattenPermissions(value as Record<string, unknown>));
    }
  }

  return result;
}

const ALL_PERMISSIONS = flattenPermissions(PERMISSIONS);

export function buildSystemActorUserContext(
  userId: SystemActorId,
  organizationId: string,
): UserContext {
  return {
    id: userId,
    organizationId,
    role: Role.OWNER,
    permissions: ALL_PERMISSIONS,
    memberRole: null,
  };
}

export function sanitizeAuditUserId(userId?: string): {
  userId?: string;
  actor?: string;
} {
  if (!userId || !isSystemActor(userId)) {
    return { userId };
  }

  return { userId: undefined, actor: userId };
}
