import { IServiceDefaultBacklogItemsRepository } from "../IServiceDefaultBacklogItemsRepository";
import { PrismaServiceDefaultBacklogItemsRepository } from "../prisma/PrismaServiceDefaultBacklogItemsRepository";

let backlogItemsRepo: IServiceDefaultBacklogItemsRepository | null = null;

export function makeServiceDefaultBacklogItemsRepository() {
  if (!backlogItemsRepo) {
    backlogItemsRepo = new PrismaServiceDefaultBacklogItemsRepository();
  }
  return backlogItemsRepo;
}
