import { DeleteOrganizationIntegrationUseCase } from "../DeleteOrganizationIntegrationUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

let deleteOrganizationIntegrationUseCase: DeleteOrganizationIntegrationUseCase;

export function makeDeleteOrganizationIntegrationUseCase() {
  if (!deleteOrganizationIntegrationUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();

    deleteOrganizationIntegrationUseCase =
      new DeleteOrganizationIntegrationUseCase(
        organizationIntegrationRepository
      );
  }

  return deleteOrganizationIntegrationUseCase;
}
