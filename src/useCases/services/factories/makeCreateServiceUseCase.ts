import { PrismaServiceTypeRepository } from "@/repositories/prisma/PrismaServiceTypeRepository";
import { CreateServiceTypeUseCase } from "../CreateServiceTypeUseCase";

let createServiceTypeUseCase: CreateServiceTypeUseCase;

export function makeCreateServiceTypeUseCase() {
  if (!createServiceTypeUseCase) {
    const serviceTypeRepository = new PrismaServiceTypeRepository();
    createServiceTypeUseCase = new CreateServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return createServiceTypeUseCase;
}
