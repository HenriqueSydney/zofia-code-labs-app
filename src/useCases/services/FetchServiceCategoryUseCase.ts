import { ServiceCategory } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface FetchServiceCategoryUseCaseRequest {
  query?: string | null;
  organizationId: string;
  userId: string;
}

export class FetchServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({ query, userId, organizationId }: FetchServiceCategoryUseCaseRequest): Promise<{
    serviceCategories: ServiceCategory[];
  }> {
    const serviceCategories = await this.serviceCategoryRepository.list(organizationId, query);

    await checkUserPermissionForAsset(
      "serviceCategory",
      userId,
      serviceCategories[0],
      "READ",
    );

    return { serviceCategories };
  }
}
