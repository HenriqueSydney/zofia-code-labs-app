import { FindOrganizationIntegrationByIntegrationSlugUseCase } from "../FindOrganizationIntegrationByIntegrationSlugUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

let findOrganizationIntegrationByIntegrationSlug: FindOrganizationIntegrationByIntegrationSlugUseCase;

export function makeFindOrganizationIntegrationByIntegrationSlugUseCase() {
  if (!findOrganizationIntegrationByIntegrationSlug) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();

    findOrganizationIntegrationByIntegrationSlug =
      new FindOrganizationIntegrationByIntegrationSlugUseCase(
        organizationIntegrationRepository
      );
  }

  return findOrganizationIntegrationByIntegrationSlug;
}
