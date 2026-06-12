import { ResourceNotFoundError, ConflictError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
import { IProjectLinkable } from "@/services/IProjectLinkable";
import { fetchInfisicalSecretValues } from "@/lib/integration/fetchInfisicalSecretValues";
import { ISecretManagementService } from "@/services/secretManagement/ISecretManagementService";

interface ConnectProjectRequest {
  userId: string;
  projectSlug: string;
  serviceId: string;
  data: any;
}

export class ConnectServiceToProjectUseCase {
  constructor(
    private organizationIntegrationRepository: IOrganizationIntegrationRepository,
    private projectRepository: IProjectsRepository,
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private secretManagementService: ISecretManagementService,
    private integrationFactory: IntegrationFactory
  ) {}

  async execute({
    userId,
    projectSlug,
    serviceId,
    data,
  }: ConnectProjectRequest): Promise<void> {
    const [project, integration] = await Promise.all([
      this.projectRepository.findBySlug(projectSlug),
      this.organizationIntegrationRepository.findById(serviceId),
    ]);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não localizado");
    }

    if (!integration) {
      throw new ResourceNotFoundError("Configuração com o serviço não localizada");
    }

    const doesProjectIntegrationAlreadyExists =
      integration.projectIntegrations.findIndex(
        (integration) => integration.projectId === project.id
      );

    if (doesProjectIntegrationAlreadyExists > -1) {
      throw new ConflictError("Integração com o serviço já existe");
    }

    await Promise.all([
      checkUserPermissionForAsset(
        "organizationIntegration",
        userId,
        project,
        "UPDATE"
      ),
      checkUserPermissionForAsset(
        "organizationIntegration",
        userId,
        integration,
        "UPDATE"
      ),
    ]);

    const config = integration.config as any;
    const secretValues = await fetchInfisicalSecretValues({
      secretManagementService: this.secretManagementService,
      path: config.infisical?.path,
      keys: config.infisical?.keys || [],
      fieldsSchema:
        (integration.integrationType.fieldsSchema as Record<string, unknown>[]) ||
        [],
    });

    const instance =
      await this.integrationFactory.getIntegration<IProjectLinkable>({
        organizationId: integration.organizationId,
        type: integration.integrationType.slug as IntegrationType,
        providedSecrets: secretValues,
      });

    const result = await instance.setupProject({
      organizationId: project.organizationId,
      projectName: project.name,
      projectSlug: project.slug,
      data,
    });

    if (result) {
      await this.projectIntegrationRepository.create({
        projectId: project.id,
        organizationIntegrationId: integration.id,
        enabled: true,
        integrationTypeId: integration.integrationTypeId,
        config: {
          externalId: result.externalId,
          ...result.metadata,
        },
      });
    }

    return;
  }
}
