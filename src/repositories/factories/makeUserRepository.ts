import { IUserRepository } from "../IUsersRepository";
import { PrismaUsersRepository } from "../prisma/PrismaUsersRepository";

let UserRepo: IUserRepository | null = null;

export function makeUserRepository() {
  if (!UserRepo) {
    UserRepo = new PrismaUsersRepository();
  }
  return UserRepo;
}
