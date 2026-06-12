import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface DeleteServiceRequest {
  id: string;
  organizationId: string;
  userId: string;
}

export class DeleteServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({ id, organizationId, userId }: DeleteServiceRequest): Promise<void> {
    // 1. Verificar propriedade antes de deletar
    const existingService = await this.serviceTypeRepository.findById(
      id,
      organizationId
    );

    if (!existingService) {
      throw new ResourceNotFoundError("Serviço não encontrado.");
    }

    await checkUserPermissionForAsset(
      "serviceType",
      userId,
      existingService,
      "DELETE",
    );

    // 2. Deletar
    await this.serviceTypeRepository.delete(id);
  }
}
