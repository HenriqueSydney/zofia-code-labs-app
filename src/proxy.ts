import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";

import { routing } from "./i18n/routing";
import NextAuth from "next-auth";
import authConfig from "./lib/auth/auth.config";
import {
  canAccessRoute,
  resolveRoutePermissionRule,
} from "./lib/auth/routePermissionMap";
import {
  extractOrganizationIdFromPath,
  validateOrganizationRouteAccess,
} from "./lib/auth/organizationAccess";
import { canAccessRouteAsPortalUser } from "./lib/auth/clientPortalRouteMap";
import { MemberRole } from "@/generated/prisma/enums";
import { sanitizeCallbackUrl } from "@/lib/auth/sanitizeCallbackUrl";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

const publicPages = [
  "/auth/login",
  "/auth/remember-me",
  "/auth/invite/accept",
  "/invoices",
];
const authPages = ["/auth/login", "/auth/remember-me"];

function getDefaultAppPath(user: {
  memberRole?: MemberRole | null;
  permissions?: string[];
}): string {
  const isPortalOnly =
    user.memberRole === MemberRole.TENANT_OBSERVER &&
    (!user.permissions || user.permissions.length === 0);

  return isPortalOnly ? "/minhas-empresas" : "/dashboard";
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isDocumentSignRoute = nextUrl.pathname.includes(
    "/document-sign/webhook",
  );
  const isStripeWebhookRoute = nextUrl.pathname.includes("/api/stripe");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);

  // ------------------------------------------------------------------
  // 1. PROTEÇÃO DE API (Bearer Token customizado)
  // ------------------------------------------------------------------
  if (isApiRoute && !isAuthRoute) {
    let token: string;
    if (isDocumentSignRoute) {
      const authHeader = req.headers.get("x-documenso-secret");

      if (!authHeader) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Missing token" }),
          { status: 401, headers: { "content-type": "application/json" } },
        );
      }

      token = authHeader;

      if (token !== process.env.DOCUMENSO_WEBHOOK_KEY) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Invalid token" }),
          { status: 403, headers: { "content-type": "application/json" } },
        );
      }

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    if (isStripeWebhookRoute) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    {
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Missing token" }),
          { status: 401, headers: { "content-type": "application/json" } },
        );
      }

      token = authHeader.split(" ")[1];
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET!);
      await jwtVerify(token, secret);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 403, headers: { "content-type": "application/json" } },
      );
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ------------------------------------------------------------------
  // 2. PROTEÇÃO DE PÁGINAS (NextAuth + Next-Intl)
  // ------------------------------------------------------------------

  if (isAuthRoute) return NextResponse.next();

  const pathnameWithoutLocale =
    nextUrl.pathname.replace(/^\/(pt|en)/, "") || "/";

  const isRootPage = pathnameWithoutLocale === "/";

  if (isLoggedIn && isRootPage) {
    const targetPath = getDefaultAppPath(req.auth!.user);
    const targetUrl = new URL(targetPath, nextUrl);
    const accessError = nextUrl.searchParams.get("erro");
    if (accessError) {
      targetUrl.searchParams.set("erro", accessError);
    }
    return NextResponse.redirect(targetUrl);
  }

  if (!isLoggedIn && isRootPage) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  const isAuthPage = authPages.some((page) =>
    pathnameWithoutLocale.startsWith(page),
  );

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(
      new URL(getDefaultAppPath(req.auth!.user), nextUrl),
    );
  }

  const isPublicPage = publicPages.some(
    (page) =>
      pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith(page),
  );

  if (!isLoggedIn && !isPublicPage) {
    const callbackUrl = sanitizeCallbackUrl(nextUrl.pathname, nextUrl.search);

    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  // ------------------------------------------------------------------
  // 2.1 RBAC — bloqueio de rota por permissão (JWT, sem requisição extra)
  // ------------------------------------------------------------------
  if (isLoggedIn && req.auth?.user && !isPublicPage) {
    const user = req.auth.user;

    const portalCheck = canAccessRouteAsPortalUser(pathnameWithoutLocale, {
      memberRole: user.memberRole,
      permissions: user.permissions ?? [],
      clientMembershipSlugs: user.clientMembershipSlugs ?? [],
    });

    if (!portalCheck.allowed) {
      const homeUrl = new URL("/", nextUrl);
      homeUrl.searchParams.set(
        "erro",
        portalCheck.messageKey
          ? `portal.${portalCheck.messageKey}`
          : "accessDenied",
      );
      return NextResponse.redirect(homeUrl);
    }

    const isPortalOnly =
      user.memberRole === MemberRole.TENANT_OBSERVER &&
      (!user.permissions || user.permissions.length === 0);

    if (!isPortalOnly) {
      const organizationId = extractOrganizationIdFromPath(pathnameWithoutLocale);

      if (organizationId) {
        const routeRule = resolveRoutePermissionRule(pathnameWithoutLocale);
        const organizationAccess = validateOrganizationRouteAccess(
          {
            role: user.role,
            permissions: user.permissions ?? [],
            organizationId: user.organizationId,
            memberRole: user.memberRole,
          },
          organizationId,
          routeRule
            ? {
                permission: routeRule.permission,
                permissionsAny: routeRule.permissionsAny,
                deniedMessageKey: routeRule.messageKey,
              }
            : undefined,
        );

        if (!organizationAccess.allowed) {
          const homeUrl = new URL("/", nextUrl);
          homeUrl.searchParams.set(
            "erro",
            `routePermissions.${organizationAccess.messageKey ?? "organizationOverview"}`,
          );
          return NextResponse.redirect(homeUrl);
        }
      } else {
        const routeRule = resolveRoutePermissionRule(pathnameWithoutLocale);

        if (
          routeRule &&
          !canAccessRoute(
            {
              role: user.role,
              permissions: user.permissions ?? [],
            },
            routeRule,
          )
        ) {
          const homeUrl = new URL("/", nextUrl);
          homeUrl.searchParams.set(
            "erro",
            `routePermissions.${routeRule.messageKey}`,
          );
          return NextResponse.redirect(homeUrl);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // 3. FINALIZA COM NEXT-INTL
  // ------------------------------------------------------------------
  const response = intlMiddleware(req);
  response.headers.set("x-pathname", nextUrl.pathname);

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|css|js|woff|woff2|ttf|eot|xml|txt|map)$).*)",
    "/",
    "/(pt|en)/:path*",
  ],
};
