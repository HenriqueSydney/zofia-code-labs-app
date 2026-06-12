import { IntegrationError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

export class DeleteIntegrationTypeUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute(id: string, userId: string, organizationId: string): Promise<void> {
    await checkUserPermissionForAsset(
      "integrationType",
      userId,
      { organizationId },
      "DELETE"
    );
    const exists = await this.repository.findById(id);

    if (!exists) {
      throw new IntegrationError("Tipo de integração não encontrado.");
    }

    await this.repository.delete(id);
  }
}
