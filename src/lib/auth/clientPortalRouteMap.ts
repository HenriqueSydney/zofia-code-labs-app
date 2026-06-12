import { MemberRole } from "@/generated/prisma/enums";

const HOUSE_ONLY_PREFIXES = [
  "/settings",
  "/organization",
  "/financial",
  "/projects",
  "/contracts",
  "/purchase",
  "/dashboard",
];

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function isHouseOnlyRoute(pathnameWithoutLocale: string): boolean {
  const path = normalizePath(pathnameWithoutLocale);

  if (path === "/clients") return true;

  return HOUSE_ONLY_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isClientPortalRoute(pathnameWithoutLocale: string): boolean {
  const path = normalizePath(pathnameWithoutLocale);
  return path === "/minhas-empresas" || path.startsWith("/clients/");
}

export function extractClientSlugFromPath(
  pathnameWithoutLocale: string,
): string | null {
  const path = normalizePath(pathnameWithoutLocale);
  const match = path.match(/^\/clients\/([^/]+)/);
  return match?.[1] ?? null;
}

export type ClientPortalAccessSubject = {
  memberRole?: MemberRole | null;
  permissions?: string[];
  clientMembershipSlugs?: string[];
};

export function canAccessRouteAsPortalUser(
  pathnameWithoutLocale: string,
  subject: ClientPortalAccessSubject,
): { allowed: boolean; messageKey?: string } {
  const isObserver = subject.memberRole === MemberRole.TENANT_OBSERVER;
  const hasHousePermissions =
    Array.isArray(subject.permissions) && subject.permissions.length > 0;

  if (!isObserver || hasHousePermissions) {
    return { allowed: true };
  }

  const path = normalizePath(pathnameWithoutLocale);

  if (path === "/" || path === "") {
    return { allowed: true };
  }

  if (path === "/minhas-empresas") {
    return { allowed: true };
  }

  if (isHouseOnlyRoute(path)) {
    return {
      allowed: false,
      messageKey: "areaDenied",
    };
  }

  const slug = extractClientSlugFromPath(path);
  if (slug) {
    const allowed = subject.clientMembershipSlugs ?? [];
    if (allowed.includes(slug)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      messageKey: "clientAccessDenied",
    };
  }

  return {
    allowed: false,
    messageKey: "areaDenied",
  };
}
