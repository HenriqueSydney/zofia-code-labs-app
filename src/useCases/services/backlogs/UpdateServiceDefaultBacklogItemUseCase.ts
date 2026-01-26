import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IServiceDefaultBacklogItemsRepository,
  IUpdateServiceDefaultBacklogItemDTO,
  ServiceDefaultBacklogItemWithDetails,
} from "@/repositories/IServiceDefaultBacklogItemsRepository";

type UpdateServiceDefaultBacklogItemParams = {
  data: IUpdateServiceDefaultBacklogItemDTO;
  userId: string;
};

export class UpdateServiceDefaultBacklogItemUseCase {
  constructor(
    private serviceDefaultBacklogItemsRepository: IServiceDefaultBacklogItemsRepository,
  ) {}

  async execute({
    data,
    userId,
  }: UpdateServiceDefaultBacklogItemParams): Promise<ServiceDefaultBacklogItemWithDetails> {
    const itemExists = await this.serviceDefaultBacklogItemsRepository.findById(
      data.id,
    );

    if (!itemExists) {
      throw new Error("Item do backlog do serviço não encontrado.");
    }

    await checkUserPermissionForAsset("services", userId, itemExists, "UPDATE");

    const updatedItem =
      await this.serviceDefaultBacklogItemsRepository.update(data);

    return updatedItem;
  }
}
