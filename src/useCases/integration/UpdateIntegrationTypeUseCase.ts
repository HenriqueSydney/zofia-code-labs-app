import { IntegrationType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

interface UpdateRequest {
  id: string;
  userId: string;
  name?: string;
  logo?: string | null;
  description?: string;
}

export class UpdateIntegrationTypeUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute({
    id,
    userId,
    ...data
  }: UpdateRequest): Promise<IntegrationType> {
    await checkUserPermissionForAsset(
      "integrationType",
      userId,
      null,
      "UPDATE"
    );
    const exists = await this.repository.findById(id);

    if (!exists) {
      throw new Error("Tipo de integração não encontrado.");
    }

    return await this.repository.update(id, data);
  }
}
