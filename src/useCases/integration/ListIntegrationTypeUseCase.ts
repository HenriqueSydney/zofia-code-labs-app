import { IntegrationType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

export class ListIntegrationTypeUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute(userId: string, query?: string): Promise<IntegrationType[]> {
    await checkUserPermissionForAsset("integrationType", userId, null, "READ");

    return await this.repository.listAll(query);
  }
}
