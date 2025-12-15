import { ServiceCategory } from "@/generated/prisma/client";
import { IServiceCategoryRepository } from "@/repositories/IServiceCategoryRepository";

interface FetchServiceCategoryUseCaseRequest {
  query?: string | null;
}

export class FetchServiceCategoryUseCase {
  constructor(private serviceCategoryRepository: IServiceCategoryRepository) {}

  async execute({ query }: FetchServiceCategoryUseCaseRequest): Promise<{
    serviceCategories: ServiceCategory[];
  }> {
    const serviceCategories = await this.serviceCategoryRepository.list(query);

    return { serviceCategories };
  }
}
