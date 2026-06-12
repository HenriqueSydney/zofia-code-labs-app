import { ResourceNotFoundError } from "@/errors";
import { PrismaClient, Role, User } from "@/generated/prisma/client";
import { Adapter } from "next-auth/adapters";

function toAdapterUser(user: User) {
  return {
    id: user.id,
    email: user.email!,
    emailVerified: null,
    name: user.name,
    image: user.image,
    role: user.role,
    organizationId: user.organizationId,
  };
}

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

        return toAdapterUser(updatedUser);
      }

      const role = data.role || Role.USER;

      const organizationId = await prisma.organization.findFirst();

      if (!organizationId) {
        throw new ResourceNotFoundError("Organization not found");
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

      return toAdapterUser(newUser);
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return toAdapterUser(user);
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return toAdapterUser(user);
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

      return toAdapterUser(user);
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

      return toAdapterUser(updatedUser);
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
        user: toAdapterUser(session.user),
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
