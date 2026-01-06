import { ConnectServiceToProjectUseCase } from "../ConnectServiceToProjectUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { makeSecretManagementService } from "@/services/secretManagement/makeSecretManagementService";
import { IntegrationFactory } from "@/services/IntegrationFactory";

let connectServiceToProjectUseCase: ConnectServiceToProjectUseCase;

export function makeConnectServiceToProjectUseCase() {
  if (!connectServiceToProjectUseCase) {
    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();
    const projectRepository = makeProjectRepository();
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const secretManagementService = makeSecretManagementService();
    const integrationFactory = new IntegrationFactory();

    connectServiceToProjectUseCase = new ConnectServiceToProjectUseCase(
      organizationIntegrationRepository,
      projectRepository,
      projectIntegrationRepository,
      secretManagementService,
      integrationFactory
    );
  }

  return connectServiceToProjectUseCase;
}
