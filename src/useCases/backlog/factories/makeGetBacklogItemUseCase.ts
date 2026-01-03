import { GetBacklogItemUseCase } from "../GetBacklogItemUseCase";
import { PrismaBacklogItemsRepository } from "@/repositories/prisma/PrismaBacklogItemRepository";

let getBacklogItemUseCase: GetBacklogItemUseCase;

export function makeGetBacklogItemUseCase() {
  if (!getBacklogItemUseCase) {
    const backlogItemsRepository = new PrismaBacklogItemsRepository();
    getBacklogItemUseCase = new GetBacklogItemUseCase(backlogItemsRepository);
  }

  return getBacklogItemUseCase;
}
