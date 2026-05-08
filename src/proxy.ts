import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";

import { routing } from "./i18n/routing";
import NextAuth from "next-auth";
import authConfig from "./lib/auth/auth.config";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

const publicPages = ["/auth/login", "/auth/remember-me"];
const authPages = ["/auth/login", "/auth/remember-me"];

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isDocumentSignRoute = nextUrl.pathname.includes(
    "/document-sign/webhook"
  );

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
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }

      token = authHeader;

      if (token !== process.env.DOCUMENSO_WEBHOOK_KEY) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Invalid token" }),
          { status: 403, headers: { "content-type": "application/json" } }
        );
      }

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } else {
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Missing token" }),
          { status: 401, headers: { "content-type": "application/json" } }
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
        { status: 403, headers: { "content-type": "application/json" } }
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
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && isRootPage) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  const isAuthPage = authPages.some((page) =>
    pathnameWithoutLocale.startsWith(page)
  );

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  const isPublicPage = publicPages.some(
    (page) =>
      pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith(page)
  );

  if (!isLoggedIn && !isPublicPage) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;

    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot|xml|txt|map)$).*)",
    "/",
    "/(pt|en)/:path*",
  ],
};
