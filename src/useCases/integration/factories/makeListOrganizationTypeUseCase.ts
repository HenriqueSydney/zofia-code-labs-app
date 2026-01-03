import { ListOrganizationIntegrationsUseCase } from "../ListOrganizationIntegrationsUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

let listOrganizationIntegrationUseCase: ListOrganizationIntegrationsUseCase;

export function makeListOrganizationIntegrationUseCase() {
  if (!listOrganizationIntegrationUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();

    listOrganizationIntegrationUseCase =
      new ListOrganizationIntegrationsUseCase(
        organizationIntegrationRepository
      );
  }

  return listOrganizationIntegrationUseCase;
}
