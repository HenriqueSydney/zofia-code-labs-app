import { AuthBasePermissionStrategy } from "./auth-base-strategy";
import { Operation, UserContext } from "./types";
import { PERMISSIONS } from "@/constants/permissions";
import { UserDoesNotHavePermissionError } from "@/errors/UserDoesNotHavePermissionError";
import { assertOrganizationStaffMember } from "./assertOrganizationStaffMember";

export type OrganizationAsset = {
  organizationId: string;
};

export class AuthOrganizationStrategy extends AuthBasePermissionStrategy<OrganizationAsset> {
  protected validateSpecific(
    user: UserContext,
    _asset: OrganizationAsset | null,
    operation: Operation,
  ): void {
    assertOrganizationStaffMember(user);

    if (operation === "READ") {
      const canRead =
        user.permissions.includes(PERMISSIONS.PROJECT.READ) ||
        user.permissions.includes(PERMISSIONS.SETTINGS.MANAGE_MEMBERS) ||
        user.permissions.includes(PERMISSIONS.SETTINGS.MANAGE_BILLING);

      if (!canRead) {
        throw new UserDoesNotHavePermissionError(PERMISSIONS.PROJECT.READ);
      }

      return;
    }

    if (!user.permissions.includes(PERMISSIONS.SETTINGS.MANAGE_MEMBERS)) {
      throw new UserDoesNotHavePermissionError(
        PERMISSIONS.SETTINGS.MANAGE_MEMBERS,
      );
    }
  }
}
