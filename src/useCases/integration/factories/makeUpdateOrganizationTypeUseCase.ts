import { makeIntegrationTypeRepository } from "@/repositories/factories/makeIntegrationTypeRepository";
import { UpdateOrganizationIntegrationUseCase } from "../UpdateOrganizationIntegrationUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

let updateOrganizationIntegrationUseCase: UpdateOrganizationIntegrationUseCase;

export function makeUpdateOrganizationIntegrationUseCase() {
  if (!updateOrganizationIntegrationUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();
    const integrationTypeRepository = makeIntegrationTypeRepository();

    updateOrganizationIntegrationUseCase =
      new UpdateOrganizationIntegrationUseCase(
        organizationIntegrationRepository,
        integrationTypeRepository
      );
  }

  return updateOrganizationIntegrationUseCase;
}
