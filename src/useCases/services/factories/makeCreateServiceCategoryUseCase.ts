import { PrismaServiceCategoryRepository } from "@/repositories/prisma/PrismaServiceCategoryRepository";
import { CreateServiceCategoryUseCase } from "../CreateServiceCategoryUseCase";

let createServiceCategoryUseCase: CreateServiceCategoryUseCase;

export function makeCreateServiceCategoryUseCase() {
  if (!createServiceCategoryUseCase) {
    const serviceCategoryRepository = new PrismaServiceCategoryRepository();
    createServiceCategoryUseCase = new CreateServiceCategoryUseCase(
      serviceCategoryRepository
    );
  }

  return createServiceCategoryUseCase;
}
