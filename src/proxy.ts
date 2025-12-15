import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose"; // Recomendado para Edge

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
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth"); // Rotas internas do NextAuth

  // ------------------------------------------------------------------
  // 1. PROTEÇÃO DE API (Bearer Token customizado)
  // ------------------------------------------------------------------
  if (isApiRoute && !isAuthRoute) {
    // Se a API for pública, adicione exceção aqui.
    // Caso contrário, verifica o Bearer Token:
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Missing token" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const secret = new TextEncoder().encode(process.env.JWT_TOKEN_SECRET!);
      await jwtVerify(token, secret);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }

    // Se passou, permite a requisição API passar
    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // 2. PROTEÇÃO DE PÁGINAS (NextAuth + Next-Intl)
  // ------------------------------------------------------------------

  // Se for rota de API interna do Auth, deixa passar
  if (isAuthRoute) return NextResponse.next();

  // Remove o locale da URL para verificar os caminhos (ex: /pt/dashboard -> /dashboard)
  const pathnameWithoutLocale =
    nextUrl.pathname.replace(/^\/(pt|en)/, "") || "/";

  const isRootPage = pathnameWithoutLocale === "/";

  if (isLoggedIn && isRootPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && isRootPage) {
    const loginUrl = new URL("/auth/login", nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Verifica se é uma página de autenticação (Login/Register)
  const isAuthPage = authPages.some((page) =>
    pathnameWithoutLocale.startsWith(page)
  );

  // Se o usuário está logado e tenta acessar login, manda pro dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Se o usuário NÃO está logado e tenta acessar rota protegida
  // Defina aqui se todas são protegidas exceto as públicas
  const isPublicPage = publicPages.some(
    (page) =>
      pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith(page)
  );

  if (!isLoggedIn && !isPublicPage) {
    // Redireciona para login mantendo o locale atual se possível
    // O intlMiddleware cuidará da formatação correta do locale na URL se redirecionarmos para '/auth/login'
    // Mas aqui forçamos o redirecionamento manual:
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;

    // Constrói URL de login
    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  // ------------------------------------------------------------------
  // 3. FINALIZA COM NEXT-INTL
  // ------------------------------------------------------------------
  // Se passou por tudo, deixa o next-intl lidar com localização e resposta
  return intlMiddleware(req);
});

export const config = {
  // Matcher ajustado para ignorar arquivos estáticos e internos do Next
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot|xml|txt|map)$).*)",
    "/",
    "/(pt|en)/:path*", // Ajuste conforme seus locales configurados no routing
  ],
};
