import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { UpdateIntegrationTypeUseCase } from "../UpdateIntegrationTypeUseCase";

let updateIntegrationTypeUseCase: UpdateIntegrationTypeUseCase;

export function makeUpdateIntegrationTypeUseCase() {
  if (!updateIntegrationTypeUseCase) {
    const updateIntegrationTypeRepository = makeIntegrationTypeRepository();
    updateIntegrationTypeUseCase = new UpdateIntegrationTypeUseCase(
      updateIntegrationTypeRepository
    );
  }

  return updateIntegrationTypeUseCase;
}
