import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IBacklogItemsRepository,
  IUpdateBacklogItemDTO,
  BacklogItemWithDetails,
} from "@/repositories/IBacklogItemsRepository";

type UpdateBacklogItemParams = {
  data: IUpdateBacklogItemDTO;
  userId: string;
};

export class UpdateBacklogItemUseCase {
  constructor(private backlogItemsRepository: IBacklogItemsRepository) {}

  async execute({
    data,
    userId,
  }: UpdateBacklogItemParams): Promise<BacklogItemWithDetails> {
    const itemExists = await this.backlogItemsRepository.findById(data.id);

    if (!itemExists) {
      throw new ResourceNotFoundError("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, itemExists, "MANAGE");

    const updatedItem = await this.backlogItemsRepository.update(data);

    return updatedItem;
  }
}
