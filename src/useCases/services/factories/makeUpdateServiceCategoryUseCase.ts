import { PrismaServiceCategoryRepository } from "@/repositories/prisma/PrismaServiceCategoryRepository";
import { UpdateServiceCategoryUseCase } from "../UpdateServiceCategoryUseCase";

let updateServiceCategoryUseCase: UpdateServiceCategoryUseCase;

export function makeUpdateServiceCategoryUseCase() {
  if (!updateServiceCategoryUseCase) {
    const serviceCategoryRepository = new PrismaServiceCategoryRepository();
    updateServiceCategoryUseCase = new UpdateServiceCategoryUseCase(
      serviceCategoryRepository
    );
  }

  return updateServiceCategoryUseCase;
}
