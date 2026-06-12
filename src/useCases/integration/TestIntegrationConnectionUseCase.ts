import { IntegrationError, ValidationError } from "@/errors";
import {
  IntegrationStatus,
  OrganizationIntegration,
} from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";
import { IntegrationBase } from "@/services/IntegrationBase";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
import { fetchInfisicalSecretValues } from "@/lib/integration/fetchInfisicalSecretValues";
import { ISecretManagementService } from "@/services/secretManagement/ISecretManagementService";

interface ITestIntegrationConnectionUseCaseParams {
  organizationId: string;
  userId: string;
  integrationId: string;
}

export class TestIntegrationConnectionUseCase {
  constructor(
    private repository: IOrganizationIntegrationRepository,
    private secretManagementService: ISecretManagementService,
    private integrationFactory: IntegrationFactory,
  ) {}

  async execute({
    organizationId,
    userId,
    integrationId,
  }: ITestIntegrationConnectionUseCaseParams): Promise<{
    message: string;
    status: IntegrationStatus;
  }> {
    const integration = await this.repository.findById(integrationId);
    if (!integration) throw new IntegrationError("Integração não encontrada.");

    // 2. Valida permissão
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      { organizationId: integration.organizationId },
      "READ",
    );

    const config = integration.config as any;
    const fieldsSchema =
      (integration.integrationType.fieldsSchema as Record<string, unknown>[]) ||
      [];

    try {
      const secretValues = await fetchInfisicalSecretValues({
        secretManagementService: this.secretManagementService,
        path: config.infisical?.path,
        keys: config.infisical?.keys || [],
        fieldsSchema,
      });

      const instance =
        await this.integrationFactory.getIntegration<IntegrationBase>({
          organizationId: organizationId,
          type: integration.integrationType.slug as IntegrationType,
          providedSecrets: secretValues,
        });

      const result = await instance.healthCheck();

      if (result.status !== "up") {
        throw new ValidationError("Serviço não está saudável");
      }

      // Simulação de teste bem sucedido
      const healthStatus = "HEALTHY";

      // 5. Atualiza o status de saúde no banco
      await this.repository.update(integrationId, {
        healthStatus,
        config: {
          ...config,
          metadata: {
            ...config.metadata,
            lastTestAt: new Date().toISOString(),
          },
        },
      });
      return { message: "Conexão realizada com sucesso", status: "HEALTHY" };
    } catch (error: any) {
      // 6. Se falhar, marca como UNHEALTHY e salva o erro
      await this.repository.update(integrationId, {
        healthStatus: "ERROR",
        config: {
          ...config,
          metadata: {
            ...config.metadata,
            lastTestAt: new Date().toISOString(),
            lastError: error.message,
          },
        },
      });
      return { message: "Conexão realizada com sucesso", status: "ERROR" };
    }
  }
}
