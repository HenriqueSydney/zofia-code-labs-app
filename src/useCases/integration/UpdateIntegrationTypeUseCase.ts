import { IntegrationError } from "@/errors";
import { IntegrationType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

interface UpdateRequest {
  id: string;
  userId: string;
  name?: string;
  logo?: string | null;
  description?: string;
  organizationId: string;
}

export class UpdateIntegrationTypeUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute({
    id,
    userId,
    organizationId,
    ...data
  }: UpdateRequest): Promise<IntegrationType> {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new IntegrationError("Tipo de integração não encontrado.");
    }

    await checkUserPermissionForAsset(
      "integrationType",
      userId,
      { organizationId },
      "UPDATE",
    );

    return await this.repository.update(id, data);
  }
}
