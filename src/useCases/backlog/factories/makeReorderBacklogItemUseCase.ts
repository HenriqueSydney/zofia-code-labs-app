import { ReorderBacklogItemUseCase } from "../ReorderBacklogItemUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";
import { PrismaProjectsRepository } from "@/repositories/prisma/PrismaProjectsRepository";

let updateBacklogItemUseCase: ReorderBacklogItemUseCase;

export function makeReorderBacklogItemUseCase() {
  if (!updateBacklogItemUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    const projectsRepository = new PrismaProjectsRepository();
    updateBacklogItemUseCase = new ReorderBacklogItemUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  }

  return updateBacklogItemUseCase;
}
