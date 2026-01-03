import { DeleteBacklogItemUseCase } from "../DeleteBacklogItemUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let deleteBacklogItemUseCase: DeleteBacklogItemUseCase;

export function makeDeleteBacklogItemUseCase() {
  if (!deleteBacklogItemUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    deleteBacklogItemUseCase = new DeleteBacklogItemUseCase(
      backlogItemsRepository
    );
  }

  return deleteBacklogItemUseCase;
}
