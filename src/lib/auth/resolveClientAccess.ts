import { MemberRole } from "@/generated/prisma/enums";
import { assertClientSlugAccess } from "@/lib/auth/assertClientEmployeePermission";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { Operation } from "@/lib/auth/strategies/types";

export type ObserverAccessSubject = {
  memberRole?: MemberRole | null;
  clientMembershipSlugs?: string[];
};

export function canObserverAccessClientSlug(
  subject: ObserverAccessSubject | null | undefined,
  clientSlug: string,
): boolean {
  if (subject?.memberRole !== MemberRole.TENANT_OBSERVER) {
    return true;
  }

  const allowed = subject.clientMembershipSlugs ?? [];
  return allowed.includes(clientSlug);
}

type AssertClientAccessParams = {
  userId: string;
  memberRole?: MemberRole | null;
  clientSlug: string;
  client: { organizationId: string };
  operation: Operation;
  assetType?: "client" | "clientEmployee";
};

export async function assertClientAccessForUser({
  userId,
  memberRole,
  clientSlug,
  client,
  operation,
  assetType = "client",
}: AssertClientAccessParams): Promise<void> {
  if (memberRole === MemberRole.TENANT_OBSERVER) {
    await assertClientSlugAccess(userId, clientSlug);
    return;
  }

  await checkUserPermissionForAsset(assetType, userId, client, operation);
}
