import NextAuth from "next-auth";

import authConfig from "@/lib/auth/auth.config";

import { PrismaAdapter } from "./lib/auth/prisma-adapter";
import { extractClientIp } from "./lib/auth/extractClientIp";
import { loadUserProfileClaims } from "./lib/auth/loadUserProfileClaims";
import { loadClientMemberships } from "./lib/auth/loadClientMemberships";
import { prisma } from "./lib/prisma";
import { makeRecordLoginHistoryUseCase } from "./useCases/auth/factories/makeRecordLoginHistoryUseCase";

import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { Role } from "@/generated/prisma/enums";
import { ORG_INVITE_COOKIE } from "@/constants/orgInvite";
import { applyOrgInviteSessionCookies } from "@/lib/auth/applyOrgInviteSessionCookies";
import { parseSignedOrgInviteCookieValue } from "@/lib/auth/orgInviteCookie";
import { makeCompleteOrganizationInviteLoginUseCase } from "@/useCases/organization/factories/makeCompleteOrganizationInviteLoginUseCase";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user?.id && user.organizationId) {
        token.id = user.id;
        token.role = user.role ?? Role.USER;
        token.organizationId = user.organizationId;

        const claims = await loadUserProfileClaims(
          user.id,
          user.organizationId,
        );
        token.permissions = claims.permissions;
        token.memberRole = claims.memberRole;
        token.roleName = claims.roleName;
        token.customRoleId = claims.customRoleId;

        const clientMemberships = await loadClientMemberships(
          user.id,
          user.organizationId,
        );
        token.clientMemberships = clientMemberships;
        token.clientMembershipSlugs = clientMemberships
          .filter((m) => m.status === "ACTIVE")
          .map((m) => m.clientSlug);
      }

      if (trigger === "update" && token.id && token.organizationId) {
        const claims = await loadUserProfileClaims(
          token.id,
          token.organizationId,
        );
        token.permissions = claims.permissions;
        token.memberRole = claims.memberRole;
        token.roleName = claims.roleName;
        token.customRoleId = claims.customRoleId;

        const clientMemberships = await loadClientMemberships(
          token.id,
          token.organizationId,
        );
        token.clientMemberships = clientMemberships;
        token.clientMembershipSlugs = clientMemberships
          .filter((m) => m.status === "ACTIVE")
          .map((m) => m.clientSlug);

        if (session?.user?.image) {
          token.picture = session.user.image;
        }
      }

      return token;
    },
    // Estendemos o signIn aqui porque temos acesso ao Prisma para lógica complexa
    async signIn({ user, account, profile }) {
      // 1. Atualização de Perfil (seu código existente)
      if (account?.provider && user?.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: profile?.name || user.name,
              image: profile?.picture || (profile as any)?.image || user.image,
            },
          });
        } catch (error) {
          console.error("Erro ao atualizar perfil:", error);
          // Não retornamos false aqui para não bloquear o login por erro de update de foto
        }
      }

      if (user?.id) {
        try {
          const headersList = await headers();
          const clientIp = extractClientIp(headersList.get("x-forwarded-for"));

          const recordLoginHistoryUseCase = makeRecordLoginHistoryUseCase();

          await recordLoginHistoryUseCase.execute({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            ipAddress: clientIp,
            userAgent: headersList.get("user-agent"),
          });
        } catch (error) {
          console.error("Erro ao registrar histórico de login:", error);
        }
      }

      return true;
    },
  },
  providers: [
    ...authConfig.providers, // Traz Google, Github, etc.

    // Adiciona o Credentials AQUI, pois ele usa 'prisma' e 'bcrypt'
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
    Credentials({
      id: "org-invite",
      name: "OrganizationInvite",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        const userId = credentials?.userId as string | undefined;

        if (!userId) return null;

        const cookieStore = await cookies();
        const inviteCookie = cookieStore.get(ORG_INVITE_COOKIE);
        const payload = inviteCookie?.value
          ? parseSignedOrgInviteCookieValue(inviteCookie.value)
          : null;

        if (!payload || payload.userId !== userId) return null;

        try {
          const authenticatedUser =
            await makeCompleteOrganizationInviteLoginUseCase().execute({
              userId,
              inviteToken: payload.token,
            });

          await applyOrgInviteSessionCookies(userId);

          return {
            id: authenticatedUser.id,
            name: authenticatedUser.name,
            email: authenticatedUser.email,
            image: authenticatedUser.image,
            role: authenticatedUser.role,
            organizationId: authenticatedUser.organizationId,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
