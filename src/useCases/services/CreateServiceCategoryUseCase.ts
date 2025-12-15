import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface CreateCreateServiceCategoryUseCaseRequest {
  organizationId: string;
  name: string;
  description?: string | null;
  taxCode?: string | null;
}

export class CreateServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({
    organizationId,
    name,
    description,
    taxCode,
  }: CreateCreateServiceCategoryUseCaseRequest): Promise<void> {
    const serviceAlreadyExists =
      await this.serviceCategoryRepository.findByName(name, organizationId);

    if (serviceAlreadyExists) {
      throw new Error(
        "Já existe uma categoria de serviço cadastrada com este nome."
      );
    }

    await this.serviceCategoryRepository.create({
      organizationId,
      name,
      description,
      taxCode,
    });
  }
}
