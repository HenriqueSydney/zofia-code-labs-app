import { BacklogStatus } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IBacklogItemsRepository } from "@/repositories/IBacklogItemsRepository";

interface UpdateBacklogStatusRequest {
  id: string;
  newStatus: BacklogStatus;
  userId: string;
}

export class UpdateBacklogItemStatusUseCase {
  constructor(private backlogItemsRepository: IBacklogItemsRepository) {}

  async execute({
    id,
    newStatus,
    userId,
  }: UpdateBacklogStatusRequest): Promise<void> {
    const itemExists = await this.backlogItemsRepository.findById(id);

    if (!itemExists) {
      throw new Error("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, itemExists, "UPDATE");

    // Método otimizado criado no Repositório para update parcial
    await this.backlogItemsRepository.updateStatus(id, newStatus);
  }
}
