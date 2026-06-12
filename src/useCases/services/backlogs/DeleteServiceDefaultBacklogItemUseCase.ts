import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceDefaultBacklogItemsRepository } from "@/repositories/IServiceDefaultBacklogItemsRepository";

interface DeleteServiceDefaultBacklogItemRequest {
  id: string;
  userId: string;
}

export class DeleteServiceDefaultBacklogItemUseCase {
  constructor(
    private serviceDefaultBacklogItemsRepository: IServiceDefaultBacklogItemsRepository,
  ) {}

  async execute({
    id,
    userId,
  }: DeleteServiceDefaultBacklogItemRequest): Promise<void> {
    const itemExists =
      await this.serviceDefaultBacklogItemsRepository.findById(id);

    if (!itemExists) {
      throw new ResourceNotFoundError("Item do backlog do serviço não encontrado.");
    }

    await checkUserPermissionForAsset("servicesBacklog", userId, itemExists, "DELETE");

    await this.serviceDefaultBacklogItemsRepository.delete(id);
  }
}
