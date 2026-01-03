import { ReorderBacklogItemUseCase } from "../ReorderBacklogItemUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let updateBacklogItemUseCase: ReorderBacklogItemUseCase;

export function makeReorderBacklogItemUseCase() {
  if (!updateBacklogItemUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    updateBacklogItemUseCase = new ReorderBacklogItemUseCase(
      backlogItemsRepository
    );
  }

  return updateBacklogItemUseCase;
}
