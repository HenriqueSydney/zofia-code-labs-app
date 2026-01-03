import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { ListIntegrationTypeUseCase } from "../ListIntegrationTypeUseCase";

let listIntegrationTypeUseCase: ListIntegrationTypeUseCase;

export function makeListIntegrationTypeUseCase() {
  if (!listIntegrationTypeUseCase) {
    const listIntegrationTypeRepository = makeIntegrationTypeRepository();
    listIntegrationTypeUseCase = new ListIntegrationTypeUseCase(
      listIntegrationTypeRepository
    );
  }

  return listIntegrationTypeUseCase;
}
