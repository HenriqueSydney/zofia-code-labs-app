import { UpdateOrganizationIntegrationUseCase } from "../UpdateOrganizationIntegrationUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

let updateOrganizationIntegrationUseCase: UpdateOrganizationIntegrationUseCase;

export function makeUpdateOrganizationIntegrationUseCase() {
  if (!updateOrganizationIntegrationUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();

    updateOrganizationIntegrationUseCase =
      new UpdateOrganizationIntegrationUseCase(
        organizationIntegrationRepository
      );
  }

  return updateOrganizationIntegrationUseCase;
}
