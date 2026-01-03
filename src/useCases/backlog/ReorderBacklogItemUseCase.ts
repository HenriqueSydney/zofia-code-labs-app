import { BacklogStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IBacklogItemsRepository,
} from "@/repositories/IBacklogItemsRepository";

type ReorderBacklogItemParams = {
  id: string;
  newPositionIndex: number;
  allSortedIds: string[];
  userId: string;
  status?: BacklogStatus
};

export class ReorderBacklogItemUseCase {
  constructor(private backlogItemsRepository: IBacklogItemsRepository) {}

  async execute({
    id,
    newPositionIndex,
    allSortedIds,
    userId,
    status
  }: ReorderBacklogItemParams): Promise<void> {
    const itemExists = await this.backlogItemsRepository.findById(id);

    if (!itemExists) {
      throw new Error("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, itemExists, "UPDATE");


    await this.backlogItemsRepository.reorderItem(
      id,
      newPositionIndex,
      allSortedIds,
      status
    );
  }
}
