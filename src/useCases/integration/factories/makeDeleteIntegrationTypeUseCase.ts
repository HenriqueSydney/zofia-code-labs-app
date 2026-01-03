import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { DeleteIntegrationTypeUseCase } from "../DeleteIntegrationTypeUseCase";

let deleteIntegrationTypeUseCase: DeleteIntegrationTypeUseCase;

export function makeDeleteIntegrationTypeUseCase() {
  if (!deleteIntegrationTypeUseCase) {
    const deleteIntegrationTypeRepository = makeIntegrationTypeRepository();
    deleteIntegrationTypeUseCase = new DeleteIntegrationTypeUseCase(
      deleteIntegrationTypeRepository
    );
  }

  return deleteIntegrationTypeUseCase;
}
