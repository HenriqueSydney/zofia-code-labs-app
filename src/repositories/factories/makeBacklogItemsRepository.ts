import { IBacklogItemsRepository } from "../IBacklogItemsRepository";
import { PrismaBacklogItemsRepository } from "../prisma/PrismaBacklogItemRepository";

let backlogItemsRepo: IBacklogItemsRepository | null = null;

export function makeBacklogItemsRepository() {
  if (!backlogItemsRepo) {
    backlogItemsRepo = new PrismaBacklogItemsRepository();
  }
  return backlogItemsRepo;
}
