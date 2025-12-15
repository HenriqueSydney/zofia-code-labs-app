import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface DeleteServiceRequest {
  id: string;
  organizationId: string;
}

export class DeleteServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({ id, organizationId }: DeleteServiceRequest): Promise<void> {
    // 1. Verificar propriedade antes de deletar
    const existingService = await this.serviceCategoryRepository.findById(
      id,
      organizationId
    );

    if (!existingService) {
      throw new Error(
        "Categoria de Serviço não encontrado ou você não tem permissão para removê-lo."
      );
    }

    // 2. Deletar
    await this.serviceCategoryRepository.delete(id);
  }
}
