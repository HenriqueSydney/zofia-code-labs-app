import { randomUUID } from "node:crypto";
import {
  Account,
  CustomRole,
  LoginHistory,
  Member,
  Organization,
  Prisma,
  Role,
  User,
} from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import { getPaginationQuery } from "../../utils/getPaginationQuery";
import {
  IUserRepository,
  UserSafe,
  UserSafeWithPermissions,
  UserWithAllInfo,
} from "../IUsersRepository";
import { Pagination } from "../../@types/Pagination";

type UserRecord = User & { passwordHash: string | null };

export class InMemoryUsersRepository implements IUserRepository {
  public items: UserRecord[] = [];
  public accounts: Account[] = [];
  public loginHistories: LoginHistory[] = [];
  public organizations: Organization[] = [];
  public members: Member[] = [];
  public customRoles: CustomRole[] = [];

  async create(
    data: Prisma.UserUncheckedCreateInput,
    _tx?: Prisma.TransactionClient,
  ): Promise<UserSafe> {
    const now = date().toDate();
    const user: UserRecord = {
      id: randomUUID(),
      organizationId: data.organizationId,
      name: data.name ?? null,
      email: data.email,
      emailVerified:
        data.emailVerified instanceof Date ? data.emailVerified : null,
      passwordHash: data.passwordHash ?? null,
      image: data.image ?? null,
      role: (data.role as Role) ?? "USER",
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(user);
    return this.mapToSafeUser(user);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserSafe> {
    const user = this.items.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.image = avatarUrl;
    user.updatedAt = date().toDate();
    return this.mapToSafeUser(user);
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const user = this.items.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.passwordHash = newPasswordHash;
    user.updatedAt = date().toDate();
  }

  async findUserByIdWithPassword(
    userId: string,
  ): Promise<{ id: string; passwordHash: string | null } | null> {
    const user = this.items.find((item) => item.id === userId);
    if (!user) return null;
    return { id: user.id, passwordHash: user.passwordHash };
  }

  async findUserById(
    userId: string,
    organizationId: string,
  ): Promise<UserSafeWithPermissions | null> {
    const user = this.items.find((item) => item.id === userId);
    if (!user) return null;

    const claims = this.loadUserProfileClaims(userId, organizationId);
    const { passwordHash, ...rest } = user;

    return {
      ...rest,
      hasPassword: !!passwordHash,
      permissions: claims.permissions,
      roleName: claims.roleName ?? undefined,
      memberRole: claims.memberRole,
    };
  }

  async findUserByEmail(email: string): Promise<UserSafe | null> {
    const user = this.items.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) return null;
    return this.mapToSafeUser(user);
  }

  async findUserByIdAndReturnAllInfo(
    userId: string,
  ): Promise<UserWithAllInfo | null> {
    const user = this.items.find((item) => item.id === userId);
    if (!user) return null;

    const { passwordHash, ...rest } = user;
    const organization =
      this.organizations.find((org) => org.id === user.organizationId) ?? null;

    return {
      ...rest,
      hasPassword: !!passwordHash,
      accounts: this.accounts.filter((account) => account.userId === userId),
      loginHistories: this.loginHistories
        .filter((history) => history.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      organization,
    };
  }

  async fetchUsers(
    query: string = "",
    pagination?: Pagination,
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }> {
    let filtered = [...this.items];

    if (query) {
      const normalizedQuery = query.toLowerCase();
      filtered = filtered.filter((user) =>
        user.name?.toLowerCase().includes(normalizedQuery),
      );
    }

    const totalOfRecords = filtered.length;
    const paginationDef = getPaginationQuery(pagination);
    const skip = "skip" in paginationDef ? (paginationDef.skip as number) : 0;
    const take =
      "take" in paginationDef ? (paginationDef.take as number) : filtered.length;

    const users = filtered.slice(skip, skip + take).map((user) => this.mapToSafeUser(user));

    return { totalOfRecords, users };
  }

  async deleteUser(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== userId);
  }

  async countTotalUsers(): Promise<number> {
    return this.items.length;
  }

  async fetchUsersByOrganizationId(
    organizationId: string,
    pagination?: Pagination,
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }> {
    const filtered = this.items.filter(
      (item) => item.organizationId === organizationId,
    );
    const totalOfRecords = filtered.length;
    const paginationDef = getPaginationQuery(pagination);
    const skip = "skip" in paginationDef ? (paginationDef.skip as number) : 0;
    const take =
      "take" in paginationDef ? (paginationDef.take as number) : filtered.length;

    const users = filtered.slice(skip, skip + take).map((user) => this.mapToSafeUser(user));

    return { totalOfRecords, users };
  }

  private mapToSafeUser(user: UserRecord): UserSafe {
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      hasPassword: !!passwordHash,
    };
  }

  private loadUserProfileClaims(userId: string, organizationId: string) {
    const member = this.members
      .filter(
        (item) =>
          item.userId === userId &&
          item.organizationId === organizationId &&
          item.removedAt === null,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!member) {
      return {
        permissions: [] as string[],
        roleName: null as string | null,
      };
    }

    const customRole = member.customRoleId
      ? (this.customRoles.find((role) => role.id === member.customRoleId) ?? null)
      : null;

    const rolePermissions = customRole?.permissions ?? [];
    const specificPermissions = member.specificPermissions ?? [];
    const permissions = Array.from(
      new Set([...rolePermissions, ...specificPermissions]),
    );

    return {
      permissions,
      roleName: customRole?.name ?? member.role,
    };
  }
}
