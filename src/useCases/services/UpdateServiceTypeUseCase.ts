import { ResourceNotFoundError } from "@/errors";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";

interface UpdateServiceRequest {
  id: string;
  organizationId: string;
  userId: string;
  data: {
    name: string;
    categoryId?: string;
    description?: string | null;
    basePrice?: number | null;
    active?: boolean;
  };
}

export class UpdateServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    id,
    organizationId,
    userId,
    data,
  }: UpdateServiceRequest): Promise<void> {
    // 1. Verificar se o serviço existe E pertence à organização
    const existingService = await this.serviceTypeRepository.findById(
      id,
      organizationId,
    );

    if (!existingService) {
      throw new ResourceNotFoundError("Serviço não encontrado.");
    }

    await checkUserPermissionForAsset(
      "serviceType",
      userId,
      existingService,
      "UPDATE",
    );

    // 2. Atualizar
    await this.serviceTypeRepository.update(id, {
      organizationId,
      ...data,
    });
  }
}
