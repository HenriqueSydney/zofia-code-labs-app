import { AppError } from "@/errors/AppError";
import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";
import { IntegrationBase } from "@/services/IntegrationBase";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
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
    private integrationFactory: IntegrationFactory
  ) {}

  async execute({
    organizationId,
    userId,
    integrationId,
  }: ITestIntegrationConnectionUseCaseParams): Promise<OrganizationIntegration> {
    const integration = await this.repository.findById(integrationId);
    if (!integration) throw new Error("Integração não encontrada.");

    // 2. Valida permissão
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      { organizationId: integration.organizationId },
      "READ"
    );

    const config = integration.config as any;
    const path = config.infisical?.path;
    const keys = config.infisical?.keys || [];

    try {
      // 3. Recupera os segredos do Infisical para realizar o teste
      const secretValues: Record<string, string> = {};

      if (path && keys.length > 0) {
        for (const key of keys) {
          const value = await this.secretManagementService.getSecret(key, {
            path,
          });
          if (value) secretValues[key] = value;
        }
      }

      const instance =
        await this.integrationFactory.getIntegration<IntegrationBase>({
          organizationId: organizationId,
          type: integration.integrationType.slug as IntegrationType,
          providedSecrets: secretValues,
        });

      const result = await instance.healthCheck();

      if (result.status !== "up") {
        throw new AppError("Serviço não está saudável");
      }

      // Simulação de teste bem sucedido
      const healthStatus = "HEALTHY";

      // 5. Atualiza o status de saúde no banco
      return await this.repository.update(integrationId, {
        healthStatus,
        config: {
          ...config,
          metadata: {
            ...config.metadata,
            lastTestAt: new Date().toISOString(),
          },
        },
      });
    } catch (error: any) {
      // 6. Se falhar, marca como UNHEALTHY e salva o erro
      return await this.repository.update(integrationId, {
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
    }
  }
}
