import { PrismaServiceCategoryRepository } from "@/repositories/prisma/PrismaServiceCategoryRepository";
import { DeleteServiceCategoryUseCase } from "../DeleteServiceCategoryUseCase";

let deleteServiceCategoryUseCase: DeleteServiceCategoryUseCase;

export function makeDeleteServiceCategoryUseCase() {
  if (!deleteServiceCategoryUseCase) {
    const serviceCategoryRepository = new PrismaServiceCategoryRepository();
    deleteServiceCategoryUseCase = new DeleteServiceCategoryUseCase(
      serviceCategoryRepository
    );
  }

  return deleteServiceCategoryUseCase;
}
