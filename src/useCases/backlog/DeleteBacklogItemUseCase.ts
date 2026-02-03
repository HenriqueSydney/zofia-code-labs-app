import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IBacklogItemsRepository } from "@/repositories/IBacklogItemsRepository";

interface DeleteBacklogItemRequest {
  id: string;
  userId: string;
}

export class DeleteBacklogItemUseCase {
  constructor(private backlogItemsRepository: IBacklogItemsRepository) {}

  async execute({ id, userId }: DeleteBacklogItemRequest): Promise<void> {
    const itemExists = await this.backlogItemsRepository.findById(id);

    if (!itemExists) {
      throw new Error("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, itemExists, "MANAGE");

    await this.backlogItemsRepository.delete(id);
  }
}
