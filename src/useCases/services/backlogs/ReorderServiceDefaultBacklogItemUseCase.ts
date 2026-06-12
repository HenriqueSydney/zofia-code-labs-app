import { ResourceNotFoundError } from "@/errors";
import { BacklogStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceDefaultBacklogItemsRepository } from "@/repositories/IServiceDefaultBacklogItemsRepository";

type ReorderServiceDefaultBacklogItemParams = {
  id: string;
  newPositionIndex: number;
  allSortedIds: string[];
  userId: string;
};

export class ReorderServiceDefaultBacklogItemUseCase {
  constructor(
    private serviceDefaultBacklogItemsRepository: IServiceDefaultBacklogItemsRepository,
  ) {}

  async execute({
    id,
    newPositionIndex,
    allSortedIds,
    userId,
  }: ReorderServiceDefaultBacklogItemParams): Promise<void> {
    const itemExists =
      await this.serviceDefaultBacklogItemsRepository.findById(id);

    if (!itemExists) {
      throw new ResourceNotFoundError("Item do backlog do servço não encontrado.");
    }

    await checkUserPermissionForAsset(
      "servicesBacklog",
      userId,
      itemExists,
      "UPDATE",
    );

    await this.serviceDefaultBacklogItemsRepository.reorderItem(
      id,
      newPositionIndex,
      allSortedIds,
    );
  }
}
