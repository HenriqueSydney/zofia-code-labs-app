import { UpdateBacklogItemUseCase } from "../UpdateBacklogItemUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let updateBacklogItemUseCase: UpdateBacklogItemUseCase;

export function makeUpdateBacklogItemUseCase() {
  if (!updateBacklogItemUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    updateBacklogItemUseCase = new UpdateBacklogItemUseCase(
      backlogItemsRepository
    );
  }

  return updateBacklogItemUseCase;
}
