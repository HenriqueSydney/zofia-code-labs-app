import { PrismaProjectsRepository } from "@/repositories/prisma/PrismaProjectsRepository";
import { UpdateBacklogItemStatusUseCase } from "../UpdateBacklogItemStatusUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let updateBacklogItemStatusUseCase: UpdateBacklogItemStatusUseCase;

export function makeUpdateBacklogItemStatusUseCase() {
  if (!updateBacklogItemStatusUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    const projectsRepository = new PrismaProjectsRepository();
    updateBacklogItemStatusUseCase = new UpdateBacklogItemStatusUseCase(
      backlogItemsRepository,
      projectsRepository,
    );
  }

  return updateBacklogItemStatusUseCase;
}
