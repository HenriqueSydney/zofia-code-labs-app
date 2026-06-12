import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IBacklogItemsRepository,
  BacklogItemWithDetails,
} from "@/repositories/IBacklogItemsRepository";

interface GetBacklogItemRequest {
  id: string;
  userId: string;
}

export class GetBacklogItemUseCase {
  constructor(private backlogItemsRepository: IBacklogItemsRepository) {}

  async execute({
    id,
    userId,
  }: GetBacklogItemRequest): Promise<BacklogItemWithDetails> {
    const item = await this.backlogItemsRepository.findById(id);

    if (!item) {
      throw new ResourceNotFoundError("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, item, "READ");

    return item;
  }
}
