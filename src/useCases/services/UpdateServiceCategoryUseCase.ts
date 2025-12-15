import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface UpdateServiceRequest {
  id: string;
  organizationId: string;
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
    data,
  }: UpdateServiceRequest): Promise<void> {
    // 1. Verificar se o serviço existe E pertence à organização
    const existingService = await this.serviceCategoryRepository.findById(
      id,
      organizationId
    );

    if (!existingService) {
      throw new Error(
        "Categoria de Serviço não encontrado ou você não tem permissão para editá-lo."
      );
    }

    await this.serviceCategoryRepository.update(id, {
      organizationId,
      ...data,
    });
  }
}
