import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";

interface UpdateRequest {
  id: string;
  userId: string;
  enabled?: boolean;
  secretValues?: Record<string, string>; // Conjunto de chaves a serem atualizadas
}

export class UpdateOrganizationIntegrationUseCase {
  constructor(private repository: IOrganizationIntegrationRepository) {}

  async execute({
    id,
    enabled,
    userId,
    secretValues,
  }: UpdateRequest): Promise<OrganizationIntegration> {
    // 1. Busca a integração atual
    const integration = await this.repository.findById(id);
    if (!integration) throw new Error("Integração não encontrada.");

    // 2. Valida permissão (Multi-tenant)
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      integration,
      "UPDATE"
    );

    const currentConfig = integration.config as any;
    const path = currentConfig?.infisical?.path;

    // 3. Se houver novas chaves, atualiza no Infisical e nos Hints
    if (secretValues && path) {
      const hints = currentConfig.metadata?.hints || {};

      for (const [key, value] of Object.entries(secretValues)) {
        /**
         * Atualização no Infisical:
         * await infisicalService.updateSecret(path, key.toUpperCase(), value);
         */

        // Atualiza apenas o hint da chave que mudou
        hints[key] = `***${value.slice(-4)}`;
      }

      currentConfig.metadata.hints = hints;
      currentConfig.metadata.updatedAt = new Date().toISOString();
    }

    // 4. Persiste as mudanças (status enabled e/ou novos hints)
    return await this.repository.update(id, {
      enabled,
      config: currentConfig,
    });
  }
}
