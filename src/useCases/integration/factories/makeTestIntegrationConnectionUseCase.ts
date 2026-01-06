import { TestIntegrationConnectionUseCase } from "../TestIntegrationConnectionUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";
import { IntegrationFactory } from "@/services/IntegrationFactory";
import { makeSecretManagementService } from "@/services/secretManagement/makeSecretManagementService";

let testIntegrationConnectionUseCase: TestIntegrationConnectionUseCase;

export function makeTestIntegrationConnectionUseCase() {
  if (!testIntegrationConnectionUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();
    const secretManagementService = makeSecretManagementService();
    const integrationFactory = new IntegrationFactory();

    testIntegrationConnectionUseCase = new TestIntegrationConnectionUseCase(
      organizationIntegrationRepository,
      secretManagementService,
      integrationFactory
    );
  }

  return testIntegrationConnectionUseCase;
}
