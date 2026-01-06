import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { FindIntegrationTypeBySlugUseCase } from "../FindIntegrationTypeBySlugUseCase";

let findIntegrationTypeBySlugUseCase: FindIntegrationTypeBySlugUseCase;

export function makeFindIntegrationTypeBySlugUseCase() {
  if (!findIntegrationTypeBySlugUseCase) {
    const listIntegrationTypeRepository = makeIntegrationTypeRepository();
    findIntegrationTypeBySlugUseCase = new FindIntegrationTypeBySlugUseCase(
      listIntegrationTypeRepository
    );
  }

  return findIntegrationTypeBySlugUseCase;
}
