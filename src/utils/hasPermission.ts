import { PermissionString } from "@/constants/permissions";
import { ValidationError } from "@/errors";
import { Role } from "@/generated/prisma/enums";
import type { Session } from "next-auth";

export type PermissionSubject =
  | Session["user"]
  | { role: Role; permissions?: string[] }
  | null
  | undefined;

export type HasPermissionOptions = {
  /** Default: Role.USER — valida o array `permissions` */
  requiredRole?: Role;
};

function checkPermission(
  subject: PermissionSubject,
  permission: PermissionString,
  options?: HasPermissionOptions,
): boolean {
  if (!subject) {
    return false;
  }

  const requiredRole = options?.requiredRole ?? Role.USER;

  if (requiredRole !== Role.USER) {
    return subject.role === requiredRole;
  }

  const permissions = subject.permissions ?? [];
  return permissions.includes(permission);
}

export function hasPermission(
  subject: PermissionSubject,
  permission: PermissionString,
  options?: HasPermissionOptions,
): boolean {
  return checkPermission(subject, permission, options);
}

export function hasAnyPermission(
  subject: PermissionSubject,
  permissions: PermissionString[],
  options?: HasPermissionOptions,
): boolean {
  return permissions.some((permission) =>
    checkPermission(subject, permission, options),
  );
}

export function hasAllPermissions(
  subject: PermissionSubject,
  permissions: PermissionString[],
  options?: HasPermissionOptions,
): boolean {
  return permissions.every((permission) =>
    checkPermission(subject, permission, options),
  );
}

export function assertPermission(
  subject: PermissionSubject,
  permission: PermissionString,
  message = "Você não tem permissão para realizar esta ação",
  options?: HasPermissionOptions,
): asserts subject is NonNullable<PermissionSubject> {
  if (!checkPermission(subject, permission, options)) {
    throw new ValidationError(message);
  }
}
