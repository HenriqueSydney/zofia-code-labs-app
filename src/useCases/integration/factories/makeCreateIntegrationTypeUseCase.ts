import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { CreateIntegrationTypeUseCase } from "../CreateIntegrationTypeUseCase";

let createIntegrationTypeUseCase: CreateIntegrationTypeUseCase;

export function makeCreateIntegrationTypeUseCase() {
  if (!createIntegrationTypeUseCase) {
    const createIntegrationTypeRepository = makeIntegrationTypeRepository();
    createIntegrationTypeUseCase = new CreateIntegrationTypeUseCase(
      createIntegrationTypeRepository
    );
  }

  return createIntegrationTypeUseCase;
}
