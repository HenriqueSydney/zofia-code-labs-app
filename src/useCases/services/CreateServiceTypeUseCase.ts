import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface CreateCreateServiceTypeUseCaseRequest {
  organizationId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice?: number | null;
}

export class CreateServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    organizationId,
    categoryId,
    name,
    description,
    basePrice,
  }: CreateCreateServiceTypeUseCaseRequest): Promise<void> {
    const serviceAlreadyExists = await this.serviceTypeRepository.findByName(
      name,
      organizationId
    );

    if (serviceAlreadyExists) {
      throw new Error("Já existe um serviço cadastrado com este nome.");
    }

    if (basePrice && basePrice < 0) {
      throw new Error("O preço base não pode ser negativo.");
    }

    // 3. Criação
    await this.serviceTypeRepository.create({
      organizationId,
      categoryId,
      name,
      description,
      basePrice,
      active: true, // Default
    });
  }
}
