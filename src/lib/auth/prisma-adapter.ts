import { PrismaClient, Role } from "@/generated/prisma/client";
import { Adapter } from "next-auth/adapters";

export function PrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    // ----------------------------------------------------------------------
    // MÉTODOS DE USUÁRIO (Essenciais para a estratégia híbrida)
    // ----------------------------------------------------------------------

    async createUser(data) {
      const userExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      // Se já existe, atualizamos (comportamento de Upsert)
      if (userExists) {
        const updatedUser = await prisma.user.update({
          where: { id: userExists.id },
          data: {
            name: data.name,
            email: data.email,
            image: data.image,
          },
        });

        return {
          id: updatedUser.id,
          email: updatedUser.email!,
          emailVerified: null,
          name: updatedUser.name,
          image: updatedUser.image,
          role: updatedUser.role,
        };
      }

      const role = data.role || Role.USER;

      const organizationId = await prisma.organization.findFirst();

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          role: role as Role,
          organizationId: organizationId.id,
        },
      });

      return {
        id: newUser.id,
        email: newUser.email,
        emailVerified: null,
        name: newUser.name,
        image: newUser.image,
        role: newUser.role,
      };
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email!,
        emailVerified: null,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email!,
        emailVerified: null,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
        include: { user: true },
      });

      if (!account) return null;
      const { user } = account;

      return {
        id: user.id,
        email: user.email!,
        emailVerified: null,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },

    async updateUser(user) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          ...(user.role ? { role: user.role } : {}),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email!,
        emailVerified: null,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role,
      };
    },

    async linkAccount(account) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state?.toString(),
        },
      });
    },

    // ----------------------------------------------------------------------
    // MÉTODOS DE SESSÃO (Não usados na estratégia JWT, mas mantidos para compatibilidade)
    // ----------------------------------------------------------------------

    async createSession({ expires, sessionToken, userId }) {
      const session = await prisma.session.create({
        data: { expires, sessionToken, userId },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: session.user.id,
          email: session.user.email!,
          emailVerified: null,
          name: session.user.name,
          image: session.user.image,
          role: session.user.role,
        },
      };
    },

    async updateSession({ sessionToken, expires, userId }) {
      const session = await prisma.session.update({
        where: { sessionToken },
        data: { expires, userId },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },
  };
}
