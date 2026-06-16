import { PERMISSIONS, PermissionString } from "@/constants/permissions";
import { MemberRole, Role } from "@/generated/prisma/enums";
import {
  hasAnyPermission,
  hasPermission,
  type PermissionSubject,
} from "@/utils/hasPermission";

export type OrganizationAccessSubject = PermissionSubject & {
  organizationId?: string;
  memberRole?: MemberRole | null;
};

const STAFF_MEMBER_ROLES: MemberRole[] = [
  MemberRole.TENANT_MEMBER,
  MemberRole.TENANT_ADMIN,
];

export function extractOrganizationIdFromPath(
  pathnameWithoutLocale: string,
): string | null {
  const normalized = pathnameWithoutLocale.replace(/\/+$/, "") || "/";
  const match = normalized.match(/^\/organization\/([^/]+)/);
  return match?.[1] ?? null;
}

export function isOrganizationStaffMember(
  subject: OrganizationAccessSubject | null | undefined,
): boolean {
  if (!subject?.memberRole) {
    return false;
  }

  return STAFF_MEMBER_ROLES.includes(subject.memberRole);
}

export function isUserAssociatedWithOrganization(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
): boolean {
  if (!subject?.organizationId) {
    return false;
  }

  return subject.organizationId === organizationId;
}

export function canAccessOrganizationArea(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
): boolean {
  if (!subject) {
    return false;
  }

  if (subject.role === Role.OWNER) {
    return true;
  }

  if (subject.memberRole === MemberRole.TENANT_OBSERVER) {
    return false;
  }

  if (subject.memberRole === MemberRole.TENANT_MEMBER) {
    return false;
  }

  if (!isOrganizationStaffMember(subject)) {
    return false;
  }

  return isUserAssociatedWithOrganization(subject, organizationId);
}

export function hasOrganizationPermission(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
  permission: PermissionString,
): boolean {
  if (!canAccessOrganizationArea(subject, organizationId)) {
    return false;
  }

  if (subject!.role === Role.OWNER) {
    return true;
  }

  return hasPermission(subject, permission);
}

export function hasAnyOrganizationPermission(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
  permissions: PermissionString[],
): boolean {
  if (!canAccessOrganizationArea(subject, organizationId)) {
    return false;
  }

  if (subject!.role === Role.OWNER) {
    return true;
  }

  return hasAnyPermission(subject, permissions);
}

export function canManageOrganizationMembers(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
): boolean {
  return hasOrganizationPermission(
    subject,
    organizationId,
    PERMISSIONS.SETTINGS.MANAGE_MEMBERS,
  );
}

export function canManageOrganizationBilling(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
): boolean {
  return hasOrganizationPermission(
    subject,
    organizationId,
    PERMISSIONS.SETTINGS.MANAGE_BILLING,
  );
}

export type OrganizationRouteAccessResult = {
  allowed: boolean;
  messageKey?: string;
};

export function validateOrganizationRouteAccess(
  subject: OrganizationAccessSubject | null | undefined,
  organizationId: string,
  options?: {
    permission?: PermissionString;
    permissionsAny?: PermissionString[];
    deniedMessageKey?: string;
  },
): OrganizationRouteAccessResult {
  if (!subject) {
    return { allowed: false, messageKey: "organizationOverview" };
  }

  if (subject.role === Role.OWNER) {
    return { allowed: true };
  }

  if (subject.memberRole === MemberRole.TENANT_OBSERVER) {
    return { allowed: false, messageKey: "organizationObserverDenied" };
  }

  if (!isOrganizationStaffMember(subject)) {
    return { allowed: false, messageKey: "organizationOverview" };
  }

  if (!isUserAssociatedWithOrganization(subject, organizationId)) {
    return { allowed: false, messageKey: "organizationAccessDenied" };
  }

  if (options?.permissionsAny?.length) {
    if (!hasAnyPermission(subject, options.permissionsAny)) {
      return {
        allowed: false,
        messageKey: options.deniedMessageKey ?? "organizationOverview",
      };
    }
    return { allowed: true };
  }

  if (options?.permission && !hasPermission(subject, options.permission)) {
    return {
      allowed: false,
      messageKey:
        options.deniedMessageKey ??
        permissionToRouteMessageKey(options.permission),
    };
  }

  return { allowed: true };
}

function permissionToRouteMessageKey(permission: PermissionString): string {
  const map: Partial<Record<PermissionString, string>> = {
    [PERMISSIONS.SETTINGS.MANAGE_MEMBERS]: "organizationMembers",
    [PERMISSIONS.SETTINGS.MANAGE_BILLING]: "organizationBilling",
    [PERMISSIONS.PROJECT.READ]: "organizationOverview",
  };

  return map[permission] ?? "organizationOverview";
}
