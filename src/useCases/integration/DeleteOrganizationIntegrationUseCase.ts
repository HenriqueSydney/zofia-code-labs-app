import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";

export class DeleteOrganizationIntegrationUseCase {
  constructor(private repository: IOrganizationIntegrationRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const integration = await this.repository.findById(id);
    if (!integration) throw new Error("Integração não encontrada.");
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      integration,
      "DELETE"
    );
    const config = integration.config as any;
    const path = config?.infisical?.path;

    // 1. Limpeza no Infisical (DevOps Best Practice)
    if (path) {
      // await infisicalService.deleteSecret(path, "API_KEY");
    }

    // 2. Remoção do banco
    await this.repository.delete(id);
  }
}
