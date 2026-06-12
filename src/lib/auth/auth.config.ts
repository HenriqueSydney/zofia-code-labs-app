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
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.picture;
        session.user.organizationId = token.organizationId;
        session.user.permissions = token.permissions ?? [];
        session.user.memberRole = token.memberRole ?? null;
        session.user.roleName = token.roleName ?? null;
        session.user.customRoleId = token.customRoleId ?? null;
        session.user.clientMemberships = token.clientMemberships ?? [];
        session.user.clientMembershipSlugs = token.clientMembershipSlugs ?? [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
