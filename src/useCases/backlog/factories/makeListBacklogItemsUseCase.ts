import { PrismaProjectsRepository } from "@/repositories/prisma/PrismaProjectsRepository";
import { ListBacklogItemsUseCase } from "../ListBacklogItemsUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let listBacklogItemsUseCase: ListBacklogItemsUseCase;

export function makeListBacklogItemsUseCase() {
  if (!listBacklogItemsUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    const projectsRepository = new PrismaProjectsRepository();
    listBacklogItemsUseCase = new ListBacklogItemsUseCase(
      backlogItemsRepository,
      projectsRepository
    );
  }

  return listBacklogItemsUseCase;
}
