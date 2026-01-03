import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";
import { CreateBacklogItemUseCase } from "../CreateBacklogItemUseCase";
import { PrismaProjectsRepository } from "@/repositories/prisma/PrismaProjectsRepository";

let createBacklogItemUseCase: CreateBacklogItemUseCase;

export function makeCreateBacklogItemUseCase() {
  if (!createBacklogItemUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    const projectsRepository = new PrismaProjectsRepository();
    createBacklogItemUseCase = new CreateBacklogItemUseCase(
      backlogItemsRepository,
      projectsRepository
    );
  }

  return createBacklogItemUseCase;
}
