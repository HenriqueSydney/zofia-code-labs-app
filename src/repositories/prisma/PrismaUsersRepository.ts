import { Prisma, User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  IUserRepository,
  UserSafe,
  UserSafeWithPermissions,
  UserWithAllInfo,
} from "../IUsersRepository";
import { Pagination } from "@/@types/Pagination";
import { getPaginationQuery } from "@/utils/getPaginationQuery";

export class PrismaUsersRepository implements IUserRepository {
  async create(
    data: Prisma.UserUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserSafe> {
    const client = tx || prisma;

    const user = await client.user.create({
      data: {
        ...data,
      },
    });

    return this.mapToSafeUser(user);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserSafe> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });

    return this.mapToSafeUser(user);
  }

  async findUserById(userId: string): Promise<UserSafeWithPermissions | null> {
    // 1. Buscamos o usuário trazendo o relacionamento do CustomRole
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        customRole: true, // Necessário para acessar as permissões do cargo
      },
    });

    if (!user) return null;

    // 2. Extraímos as permissões de ambas as fontes
    const rolePermissions = user.customRole?.permissions || [];
    const specificPermissions = user.specificPermissions || [];

    // 3. "Achatamos" e removemos duplicatas usando Set
    // O Set garante que se "project:read" existir nos dois, aparecerá apenas uma vez.
    const uniquePermissions = Array.from(
      new Set([...rolePermissions, ...specificPermissions]),
    );

    // 4. Mapeamos para o objeto seguro (reaproveitando lógica se possível)
    // Como o 'user' aqui tem o 'customRole' no tipo devido ao include,
    // precisamos ter cuidado ao passar para mappers genéricos ou fazer manualmente.

    const { passwordHash, customRole, ...rest } = user;

    return {
      ...rest,
      hasPassword: !!passwordHash,
      permissions: uniquePermissions, // Array unificado de strings
      roleName: customRole?.name ?? user.role, // Opcional: Fallback para o role padrão se não tiver custom
    };
  }

  async findUserByEmail(email: string): Promise<UserSafe | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return null;

    return this.mapToSafeUser(user);
  }

  async findUserByIdWithPassword(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
  }

  // 2. Método para atualizar a senha
  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async findUserByIdAndReturnAllInfo(
    userId: string,
  ): Promise<UserWithAllInfo | null> {
    const user = await prisma.user.findUnique({
      include: {
        accounts: true,
        // 🟢 AJUSTE AQUI: Traz apenas os 10 últimos logins
        loginHistories: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        organization: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) return null;

    // Separa o hash do resto das propriedades (incluindo as relações)
    const { passwordHash, ...rest } = user;

    // Retorna o objeto com hasPassword: true/false
    return {
      ...rest,
      hasPassword: !!passwordHash,
    };
  }

  async fetchUsers(
    query: string = "",
    pagination?: Pagination,
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }> {
    let where: Prisma.UserWhereInput = {};

    if (query) {
      where = {
        name: {
          contains: query.toLocaleLowerCase(),
          mode: "insensitive",
        },
      };
    }

    let paginationDefinition = {};
    if (pagination) {
      if (pagination.page || pagination.numberPerPage) {
        paginationDefinition = {
          skip: ((pagination.page ?? 1) - 1) * (pagination.numberPerPage ?? 10),
          take: pagination.numberPerPage,
        };
      }
    }

    const [totalOfRecords, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        ...paginationDefinition,
      }),
    ]);

    // Mapeia todos os usuários da lista para o formato seguro
    const safeUsers = users.map((user) => this.mapToSafeUser(user));

    return { totalOfRecords, users: safeUsers };
  }

  async fetchUsersByOrganizationId(
    organizationId: string,
    pagination?: Pagination,
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }> {
    let where: Prisma.UserWhereInput = {
      organizationId,
    };

    const paginationDefinition = getPaginationQuery(pagination);

    const [totalOfRecords, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        ...paginationDefinition,
      }),
    ]);

    // Mapeia todos os usuários da lista para o formato seguro
    const safeUsers = users.map((user) => this.mapToSafeUser(user));

    return { totalOfRecords, users: safeUsers };
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async countTotalUsers(): Promise<number> {
    return await prisma.user.count();
  }

  // --- MÉTODO PRIVADO AUXILIAR PARA EVITAR REPETIÇÃO ---
  private mapToSafeUser(user: User): UserSafe {
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      hasPassword: !!passwordHash, // Converte string/null para boolean
    };
  }
}
