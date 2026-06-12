import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface UpdateServiceRequest {
  id: string;
  organizationId: string;
  userId: string;
  data: {
    name: string;
    categoryId?: string;
    description?: string | null;
    taxCode?: string | null;
  };
}

export class UpdateServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({
    id,
    organizationId,
    userId,
    data,
  }: UpdateServiceRequest): Promise<void> {
    // 1. Verificar se o serviço existe E pertence à organização
    const existingService = await this.serviceCategoryRepository.findById(
      id,
      organizationId
    );

    if (!existingService) {
      throw new ResourceNotFoundError("Categoria de Serviço não encontrado.");
    }

    await checkUserPermissionForAsset(
      "serviceCategory",
      userId,
      existingService,
      "UPDATE",
    );

    await this.serviceCategoryRepository.update(id, {
      organizationId,
      ...data,
    });
  }
}
