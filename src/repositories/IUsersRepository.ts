import { Pagination } from "@/@types/Pagination";
import {
  Account,
  LoginHistory,
  Organization,
  Prisma,
  User,
} from "@/generated/prisma/client";

export type UserSafe = Omit<User, "passwordHash"> & {
  hasPassword: boolean;
};

export type UserSafeWithPermissions = UserSafe & {
  permissions: string[]; // O array final unificado
  roleName?: string; // Opcional: útil para exibir na UI o nome do cargo
};
// Atualiza o tipo UserWithAllInfo para usar o UserSafe como base
export type UserWithAllInfo = UserSafe & {
  accounts: Account[];
  loginHistories: LoginHistory[];
  organization: Organization | null; // Ajuste conforme seu schema
};

export interface IUserRepository {
  create(
    data: Prisma.UserUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<UserSafe>;
  updateAvatar(userId: string, avatarUrl: string): Promise<UserSafe>;
  updatePassword(userId: string, newPasswordHash: string): Promise<void>;
  findUserByIdWithPassword(
    userId: string,
  ): Promise<{ id: string; passwordHash: string | null } | null>;
  findUserById(userId: string): Promise<UserSafeWithPermissions | null>;
  findUserByEmail(email: string): Promise<UserSafe | null>;
  findUserByIdAndReturnAllInfo(userId: string): Promise<UserWithAllInfo | null>;
  fetchUsers(
    query?: string,
    pagination?: Pagination,
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }>;
  deleteUser(userId: string): Promise<void>;
  countTotalUsers(): Promise<number>;
  fetchUsersByOrganizationId(
    organizationId: string,
    pagination?: Pagination,
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }>;
}
