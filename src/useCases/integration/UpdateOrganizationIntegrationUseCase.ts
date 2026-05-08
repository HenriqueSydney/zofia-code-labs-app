import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";
import { makeSecretManagementService } from "@/services/secretManagement/makeSecretManagementService";

interface UpdateRequest {
  id: string;
  userId: string;
  enabled?: boolean;
  enableByol?: boolean; // Permite alternar entre instâncias
  secretValues?: Record<string, string>;
}

export class UpdateOrganizationIntegrationUseCase {
  constructor(
    private repository: IOrganizationIntegrationRepository,
    private typeRepository: IIntegrationTypeRepository // Adicionado para validar schema
  ) {}

  async execute({
    id,
    enabled,
    userId,
    enableByol,
    secretValues,
  }: UpdateRequest): Promise<OrganizationIntegration> {
   
    // 1. Busca a integração atual
    const integration = await this.repository.findById(id);
    if (!integration) throw new Error("Integração não encontrada.");

    // 2. Valida permissão (Multi-tenant)
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      { organizationId: integration.organizationId },
      "UPDATE"
    );
   
    // 3. Busca o Tipo para pegar o schema de campos
    const type = await this.typeRepository.findById(
      integration.integrationTypeId
    );
    if (!type) throw new Error("Tipo de integração não encontrado.");

    const fieldsSchema = (type.fieldsSchema as any[]) || [];
    const currentConfig = integration.config as any;

    // Determina o estado final do BYOL (se não enviado, mantém o atual)
    const finalEnableByol =
      enableByol !== undefined ? enableByol : integration.enableByol;

    // 4. Validação de campos obrigatórios se estiver em modo BYOL
    if (finalEnableByol && secretValues) {
      // Se estiver migrando para BYOL agora ou atualizando chaves,
      // validamos se as chaves enviadas condizem com o schema
      for (const field of fieldsSchema) {
        // Se for uma migração para BYOL, todos os campos do schema devem estar presentes
        if (
          enableByol === true &&
          !integration.enableByol &&
          !secretValues[field.key]
        ) {
          throw new Error(
            `O campo '${field.label}' é obrigatório para ativar instância própria.`
          );
        }
      }
    }

    // 5. Lógica de Segredos (Infisical)
    const shouldSaveToInfisical =
      !type.enableByol || (type.enableByol && finalEnableByol);
    const infisicalPath =
      currentConfig?.infisical?.path ||
      `/${integration.organizationId}/integrations/${type.slug}`;
    const hints = currentConfig.metadata?.hints || {};

    if (shouldSaveToInfisical && secretValues) {
      const secretManagementService = makeSecretManagementService();

      // Garante que a pasta existe (caso tenha sido deletada ou erro no create)
      await secretManagementService.createFolder(infisicalPath);

      for (const [key, value] of Object.entries(secretValues)) {
        if (value) {
          await secretManagementService.upsertSecret(key, value, {
            path: infisicalPath,
          });

          // Atualiza o hint apenas do que foi alterado
          hints[key] = value.length > 4 ? `***${value.slice(-4)}` : "***";
        }
      }
    }

    // 6. Preparação do Metadata
    const metadata = {
      ...currentConfig.metadata,
      updatedAt: new Date().toISOString(),
      hints: finalEnableByol
        ? hints
        : { info: "Utilizando instância gerenciada Zofia Code Labs" },
    };

    // 7. Persistência
    return await this.repository.update(id, {
      enabled: enabled !== undefined ? enabled : integration.enabled,
      enableByol: finalEnableByol,
      config: {
        ...currentConfig,
        infisical: {
          path: shouldSaveToInfisical ? infisicalPath : null,
          env: process.env.NODE_ENV === "production" ? "prod" : "dev",
          keys: shouldSaveToInfisical ? fieldsSchema.map((f) => f.key) : [],
        },
        metadata,
      },
    });
  }
}
