import { MemberRole } from "@/generated/prisma/enums";
import type { ClientMembership } from "./loadClientMemberships";

type PortalUser = {
  memberRole?: MemberRole | null;
  permissions?: string[];
  clientMemberships?: ClientMembership[];
};

export function isPortalOnlyUser(user: PortalUser | null | undefined): boolean {
  if (!user?.memberRole) return false;
  if (user.memberRole !== MemberRole.TENANT_OBSERVER) return false;

  const hasHousePermissions =
    Array.isArray(user.permissions) && user.permissions.length > 0;

  return !hasHousePermissions;
}

export function getAllowedClientSlugs(
  user: PortalUser | null | undefined,
): string[] {
  return (user?.clientMemberships ?? [])
    .filter((m) => m.status === "ACTIVE")
    .map((m) => m.clientSlug);
}
