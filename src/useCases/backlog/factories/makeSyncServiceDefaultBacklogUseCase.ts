import { PrismaProjectsRepository } from "@/repositories/prisma/PrismaProjectsRepository";
import { SyncServiceDefaultBacklogUseCase } from "../SyncServiceDefaultBacklogUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let syncServiceDefaultBacklogUseCase: SyncServiceDefaultBacklogUseCase;

export function makeSyncServiceDefaultBacklogUseCase() {
  if (!syncServiceDefaultBacklogUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    const projectsRepository = new PrismaProjectsRepository();
    syncServiceDefaultBacklogUseCase = new SyncServiceDefaultBacklogUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  }

  return syncServiceDefaultBacklogUseCase;
}
