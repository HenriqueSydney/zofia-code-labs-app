import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface DeleteServiceRequest {
  id: string;
  organizationId: string;
  userId: string;
}

export class DeleteServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({
    id,
    organizationId,
    userId,
  }: DeleteServiceRequest): Promise<void> {
    const existingService = await this.serviceCategoryRepository.findById(
      id,
      organizationId,
    );

    if (!existingService) {
      throw new ResourceNotFoundError("Categoria de Serviço não encontrado.",);
    }

    await checkUserPermissionForAsset(
      "serviceCategory",
      userId,
      existingService,
      "DELETE",
    );

    // 2. Deletar
    await this.serviceCategoryRepository.delete(id);
  }
}
