import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

export class DeleteIntegrationTypeUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await checkUserPermissionForAsset(
      "integrationType",
      userId,
      null,
      "DELETE"
    );
    const exists = await this.repository.findById(id);

    if (!exists) {
      throw new Error("Tipo de integração não encontrado.");
    }

    await this.repository.delete(id);
  }
}
