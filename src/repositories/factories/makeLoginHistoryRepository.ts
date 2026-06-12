import { ILoginHistoryRepository } from "../ILoginHistoryRepository";
import { PrismaLoginHistoryRepository } from "../prisma/PrismaLoginHistoryRepository";

let loginHistoryRepository: ILoginHistoryRepository | null = null;

export function makeLoginHistoryRepository() {
  if (!loginHistoryRepository) {
    loginHistoryRepository = new PrismaLoginHistoryRepository();
  }
  return loginHistoryRepository;
}
