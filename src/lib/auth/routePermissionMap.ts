import { Role } from "@/generated/prisma/enums";
import type { PermissionString } from "@/constants/permissions";
import { hasAnyPermission, hasPermission } from "@/utils/hasPermission";

export type RoutePermissionSubject = {
  role: Role;
  permissions: string[];
};

export type RoutePermissionRule = {
  id: string;
  match: (pathname: string) => boolean;
  permission?: PermissionString;
  permissionsAny?: PermissionString[];
  requiredRole?: Role;
  /** Chave em `errors.server.routePermissions` */
  messageKey: string;
};

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

const organizationOverviewPattern = /^\/organization\/[^/]+$/;

/**
 * Rotas privadas que exigem permissão (ou role) antes de renderizar a page.
 * Ordem importa: regras mais específicas devem vir primeiro.
 */
export const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  {
    id: "settings-services-category",
    match: (pathname) =>
      normalizePath(pathname).startsWith("/settings/services/category"),
    permission: "service_catalog:read",
    messageKey: "serviceCategory",
  },
  {
    id: "settings-services-catalog",
    match: (pathname) =>
      normalizePath(pathname).startsWith("/settings/services/catalog"),
    permission: "service_catalog:read",
    messageKey: "serviceCatalog",
  },
  {
    id: "settings-expenses-category",
    match: (pathname) =>
      normalizePath(pathname).startsWith("/settings/expenses-category"),
    permission: "settings:manage_expense_categories",
    messageKey: "expenseCategory",
  },

  {
    id: "settings-integrations-catalog",
    match: (pathname) =>
      normalizePath(pathname).startsWith("/settings/integrations/catalog"),
    requiredRole: Role.OWNER,
    messageKey: "integrationsCatalog",
  },
  {
    id: "settings-integrations-config",
    match: (pathname) =>
      normalizePath(pathname).startsWith("/settings/integrations/config"),
    permissionsAny: [
      "settings:read_integrations",
      "settings:manage_integrations",
    ],
    messageKey: "integrationsConfig",
  },
  {
    id: "organization-members",
    match: (pathname) =>
      normalizePath(pathname).includes("/organization/") &&
      normalizePath(pathname).endsWith("/members"),
    permission: "settings:manage_members",
    messageKey: "organizationMembers",
  },
  {
    id: "organization-roles",
    match: (pathname) =>
      normalizePath(pathname).includes("/organization/") &&
      normalizePath(pathname).endsWith("/roles"),
    permission: "settings:manage_members",
    messageKey: "organizationRoles",
  },
  {
    id: "organization-billing",
    match: (pathname) =>
      normalizePath(pathname).includes("/organization/") &&
      normalizePath(pathname).endsWith("/billing"),
    permission: "settings:manage_billing",
    messageKey: "organizationBilling",
  },
  {
    id: "organization-settings",
    match: (pathname) =>
      normalizePath(pathname).includes("/organization/") &&
      normalizePath(pathname).endsWith("/settings"),
    permission: "settings:manage_members",
    messageKey: "organizationSettings",
  },
  {
    id: "organization-overview",
    match: (pathname) =>
      organizationOverviewPattern.test(normalizePath(pathname)),
    permissionsAny: ["project:read", "settings:manage_members"],
    messageKey: "organizationOverview",
  },
  {
    id: "financial",
    match: (pathname) => {
      const path = normalizePath(pathname);
      return path === "/financial" || path.startsWith("/financial/");
    },
    permission: "financial:view_dashboard",
    messageKey: "financial",
  },
  {
    id: "contracts",
    match: (pathname) => {
      const path = normalizePath(pathname);
      return path === "/contracts" || path.startsWith("/contracts/");
    },
    permission: "contract:read",
    messageKey: "contracts",
  },
  {
    id: "projects",
    match: (pathname) => {
      const path = normalizePath(pathname);
      return path === "/projects" || path.startsWith("/projects/");
    },
    permission: "project:read",
    messageKey: "projects",
  },
  {
    id: "clients",
    match: (pathname) => {
      const path = normalizePath(pathname);
      return path === "/clients" || path.startsWith("/clients/");
    },
    permission: "client:read",
    messageKey: "clients",
  },
];

export function resolveRoutePermissionRule(
  pathnameWithoutLocale: string,
): RoutePermissionRule | null {
  const path = normalizePath(pathnameWithoutLocale);
  return ROUTE_PERMISSION_RULES.find((rule) => rule.match(path)) ?? null;
}

export function canAccessRoute(
  subject: RoutePermissionSubject | null | undefined,
  rule: RoutePermissionRule,
): boolean {
  if (!subject) {
    return false;
  }

  if (subject.role === Role.OWNER) {
    return true;
  }

  if (rule.requiredRole) {
    return subject.role === rule.requiredRole;
  }

  if (rule.permissionsAny?.length) {
    return hasAnyPermission(subject, rule.permissionsAny);
  }

  if (rule.permission) {
    return hasPermission(subject, rule.permission);
  }

  return true;
}
