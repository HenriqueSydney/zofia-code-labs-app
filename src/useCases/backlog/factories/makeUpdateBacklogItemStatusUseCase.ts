import { UpdateBacklogItemStatusUseCase } from "../UpdateBacklogItemStatusUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let updateBacklogItemStatusUseCase: UpdateBacklogItemStatusUseCase;

export function makeUpdateBacklogItemStatusUseCase() {
  if (!updateBacklogItemStatusUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    updateBacklogItemStatusUseCase = new UpdateBacklogItemStatusUseCase(
      backlogItemsRepository
    );
  }

  return updateBacklogItemStatusUseCase;
}
