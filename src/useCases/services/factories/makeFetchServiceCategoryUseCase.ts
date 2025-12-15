import { PrismaServiceCategoryRepository } from "@/repositories/prisma/PrismaServiceCategoryRepository";
import { FetchServiceCategoryUseCase } from "../FetchServiceCategoryUseCase";

let fetchServiceCategoryUseCase: FetchServiceCategoryUseCase;

export function makeFetchServiceUseCase() {
  if (!fetchServiceCategoryUseCase) {
    const serviceCategoryRepository = new PrismaServiceCategoryRepository();
    fetchServiceCategoryUseCase = new FetchServiceCategoryUseCase(
      serviceCategoryRepository
    );
  }

  return fetchServiceCategoryUseCase;
}
