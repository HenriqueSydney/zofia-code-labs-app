import { ConflictError, BusinessRuleError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface CreateCreateServiceTypeUseCaseRequest {
  organizationId: string;
  userId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice?: number | null;
}

export class CreateServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    organizationId,
    userId,
    categoryId,
    name,
    description,
    basePrice,
  }: CreateCreateServiceTypeUseCaseRequest): Promise<void> {
    const serviceAlreadyExists = await this.serviceTypeRepository.findByName(
      name,
      organizationId
    );

    await checkUserPermissionForAsset(
      "serviceType",
      userId,
      serviceAlreadyExists,
      "CREATE",
    );

    if (serviceAlreadyExists) {
      throw new ConflictError("Já existe um serviço cadastrado com este nome.");
    }

    if (basePrice && basePrice < 0) {
      throw new BusinessRuleError("O preço base não pode ser negativo.");
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
