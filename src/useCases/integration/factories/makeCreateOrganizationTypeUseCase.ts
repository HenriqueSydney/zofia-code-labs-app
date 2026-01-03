import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { CreateOrganizationIntegrationUseCase } from "../CreateOrganizationIntegrationUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

let createOrganizationIntegrationUseCase: CreateOrganizationIntegrationUseCase;

export function makeCreateOrganizationIntegrationUseCase() {
  if (!createOrganizationIntegrationUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();
    const integrationTypeRepository = makeIntegrationTypeRepository();

    createOrganizationIntegrationUseCase =
      new CreateOrganizationIntegrationUseCase(
        organizationIntegrationRepository,
        integrationTypeRepository
      );
  }

  return createOrganizationIntegrationUseCase;
}
