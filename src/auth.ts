import NextAuth from "next-auth";

import authConfig from "@/lib/auth/auth.config";

import { PrismaAdapter } from "./lib/auth/prisma-adapter";
import { prisma } from "./lib/prisma";

import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { headers } from "next/headers";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
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

      // 2. LOG DE HISTÓRICO DE LOGIN (Novo código)
      if (user?.id) {
        try {
          // Captura os headers da requisição atual
          const headersList = await headers();
          const ip = headersList.get("x-forwarded-for") || "unknown";
          const userAgent = headersList.get("user-agent") || "unknown";

          // Como o IP pode vir como uma lista (ex: "127.0.0.1, 10.0.0.1"), pegamos o primeiro
          const clientIp = ip.split(",")[0].trim();

          await prisma.loginHistory.create({
            data: {
              userId: user.id,
              ipAddress: clientIp,
              userAgent: userAgent,
            },
          });
        } catch (error) {
          console.error("Erro ao salvar histórico de login:", error);
          // Importante: Não retornar false, senão o usuário não consegue logar se o log falhar
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
          user.passwordHash
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
  ],
});
