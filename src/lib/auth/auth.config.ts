import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Gitlab from "next-auth/providers/gitlab";
import Google from "next-auth/providers/google";

export default {
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 dia
  },
  providers: [
    GitHub,
    Gitlab,
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // 1. JWT: Onde a mágica acontece. Roda no login E nas requisições subsequentes para atualizar o token.
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Login inicial: pegamos dados do objeto User (que vem do DB via Adapter)
        token.id = user.id as string;
        // @ts-ignore - O Adapter já deve ter populado o role
        token.role = user.role || "TENANT_MEMBER";
        // @ts-ignore - O Adapter já deve ter populado o role
        token.organizationId = user.organizationId;
      }

      // Se você quiser atualizar a sessão no cliente manualmente (update())
      if (trigger === "update" && session?.user) {
        token.role = session.user.role;
      }

      return token;
    },
    // 2. Session: Disponibiliza os dados do token para o front-end (useSession)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.picture;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
