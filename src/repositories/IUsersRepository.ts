import { Pagination } from "@/@types/Pagination";
import {
  Account,
  LoginHistory,
  Organization,
  User,
} from "@/generated/prisma/client";

export type UserSafe = Omit<User, "passwordHash"> & {
  hasPassword: boolean;
};

// Atualiza o tipo UserWithAllInfo para usar o UserSafe como base
export type UserWithAllInfo = UserSafe & {
  accounts: Account[];
  loginHistories: LoginHistory[];
  organization: Organization | null; // Ajuste conforme seu schema
};

export interface IUserRepository {
  updateAvatar(userId: string, avatarUrl: string): Promise<UserSafe>;
  updatePassword(userId: string, newPasswordHash: string): Promise<void>;
  findUserByIdWithPassword(
    userId: string
  ): Promise<{ id: string; passwordHash: string | null } | null>;
  findUserById(userId: string): Promise<UserSafe | null>;
  findUserByIdAndReturnAllInfo(userId: string): Promise<UserWithAllInfo | null>;
  fetchUsers(
    query?: string,
    pagination?: Pagination
  ): Promise<{ totalOfRecords: number; users: UserSafe[] }>;
  deleteUser(userId: string): Promise<void>;
  countTotalUsers(): Promise<number>;
}
