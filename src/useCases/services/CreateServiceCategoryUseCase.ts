import { ConflictError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface CreateCreateServiceCategoryUseCaseRequest {
  organizationId: string;
  userId: string;
  name: string;
  description?: string | null;
  taxCode?: string | null;
}

export class CreateServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({
    organizationId,
    userId,
    name,
    description,
    taxCode,
  }: CreateCreateServiceCategoryUseCaseRequest): Promise<void> {
    const serviceAlreadyExists =
      await this.serviceCategoryRepository.findByName(name, organizationId);

    await checkUserPermissionForAsset(
      "serviceCategory",
      userId,
      { organizationId },
      "CREATE",
    );

    if (serviceAlreadyExists) {
      throw new ConflictError("Já existe uma categoria de serviço cadastrada com este nome.",);
    }

    await this.serviceCategoryRepository.create({
      organizationId,
      name,
      description,
      taxCode,
    });
  }
}
