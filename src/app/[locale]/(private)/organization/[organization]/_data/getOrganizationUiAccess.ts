import { auth } from "@/auth";
import {
  canManageOrganizationBilling,
  canManageOrganizationMembers,
} from "@/lib/auth/organizationAccess";

export async function getOrganizationUiAccess(organizationId: string) {
  const session = await auth();
  const user = session?.user;

  return {
    canManageMembers: canManageOrganizationMembers(user, organizationId),
    canManageBilling: canManageOrganizationBilling(user, organizationId),
  };
}
