
import { CreateServiceTypeUseCase } from "../CreateServiceTypeUseCase";
import { makeServiceTypeRepository } from "@/repositories/factories/makeServiceTypeRepository";

let createServiceTypeUseCase: CreateServiceTypeUseCase;

export function makeCreateServiceTypeUseCase() {
  if (!createServiceTypeUseCase) {
    const serviceTypeRepository = makeServiceTypeRepository();
    createServiceTypeUseCase = new CreateServiceTypeUseCase(
      serviceTypeRepository
    );
  }

  return createServiceTypeUseCase;
}
