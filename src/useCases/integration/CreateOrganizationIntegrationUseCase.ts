import { IntegrationError, ValidationError } from "@/errors";
import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";
import {
  getInfisicalIntegrationFieldKeys,
  getInfisicalIntegrationFields,
} from "@/schemas/integration/integrationType";
import { makeSecretManagementService } from "@/services/secretManagement/makeSecretManagementService";

interface CreateRequest {
  organizationId: string;
  userId: string;
  integrationTypeId: string;
  secretValues: Record<string, string>;
  enableByol: boolean; // Adicionado para suportar a nova lógica
}

export class CreateOrganizationIntegrationUseCase {
  constructor(
    private repository: IOrganizationIntegrationRepository,
    private typeRepository: IIntegrationTypeRepository
  ) {}

  async execute({
    organizationId,
    userId,
    integrationTypeId,
    secretValues,
    enableByol,
  }: CreateRequest): Promise<OrganizationIntegration> {
    // 1. Verificação de permissão
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      { organizationId },
      "CREATE"
    );

    // 2. Busca o Tipo de Integração
    const type = await this.typeRepository.findById(integrationTypeId);
    if (!type) {
      throw new IntegrationError("Tipo de integração não encontrado no catálogo global.");
    }

    const fieldsSchema = (type.fieldsSchema as Record<string, unknown>[]) || [];
    const infisicalFields = getInfisicalIntegrationFields(fieldsSchema);

    // 3. Validação condicional: Só valida campos se BYOL estiver ativo
    // Se for Modo Gerenciado, o usuário não envia chaves
    if (enableByol) {
      for (const field of infisicalFields) {
        if (!secretValues[String(field.key)]) {
          throw new ValidationError(
            `O campo '${field.label}' é obrigatório para instâncias próprias.`,
          );
        }
      }
    }

    // 4. Evitar duplicidade
    const alreadyConnected = await this.repository.findByOrgAndType(
      organizationId,
      integrationTypeId
    );
    if (alreadyConnected) {
      throw new ValidationError("Esta organização já possui esta integração configurada.");
    }

    const hints: Record<string, string> = {};

    /**
     * 6. Gravação no Infisical (Apenas se BYOL ou Integração Obrigatória)
     */
    const shouldSaveToInfisical =
      !type.enableByol || (type.enableByol && enableByol);
    const infisicalPath = `/${organizationId}/integrations/${type.slug}`;

    if (shouldSaveToInfisical) {
      const secretManagementService = makeSecretManagementService();

      // 1. Garantir que a pasta existe (incluindo subpastas)
      await secretManagementService.createFolder(infisicalPath);

      // 2. Gravar os segredos (tags não vão para o Infisical)
      for (const field of infisicalFields) {
        const fieldKey = String(field.key);
        const value = secretValues[fieldKey];

        if (value) {
          await secretManagementService.upsertSecret(fieldKey, value, {
            path: infisicalPath,
          });

          hints[fieldKey] = value.length > 4 ? `***${value.slice(-4)}` : "***";
        }
      }
    }

    // 7. Salvar no Prisma
    return await this.repository.create({
      organizationId,
      integrationTypeId,
      enabled: true,
      enableByol, // Salvamos a escolha do usuário
      healthStatus: "HEALTHY",
      config: {
        infisical: {
          path: shouldSaveToInfisical ? infisicalPath : null,
          env: process.env.NODE_ENV === "production" ? "prod" : "dev",
          keys: shouldSaveToInfisical
            ? getInfisicalIntegrationFieldKeys(fieldsSchema)
            : [],
        },
        metadata: {
          addedAt: new Date().toISOString(),
          hints: enableByol
            ? hints
            : { info: "Utilizando instância gerenciada Zofia Code Labs" },
        },
      },
    });
  }
}
