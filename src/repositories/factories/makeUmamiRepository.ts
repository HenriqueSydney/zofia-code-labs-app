import { IUmamiRepository } from "../IUmamiRepository";
import { PrismaUmamiRepository } from "../prisma/PrismaUmamiRepository";

let umamiRepo: IUmamiRepository | null = null;

export function makeUmamiRepository() {
  if (!umamiRepo) {
    umamiRepo = new PrismaUmamiRepository();
  }
  return umamiRepo;
}
