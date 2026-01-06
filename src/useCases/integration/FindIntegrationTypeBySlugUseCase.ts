import { IntegrationType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

export class FindIntegrationTypeBySlugUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute(userId: string, slug: string): Promise<IntegrationType | null> {
    const integraitonType = await this.repository.findBySlug(slug);
    await checkUserPermissionForAsset("integrationType", userId, null, "READ");

    return integraitonType;
  }
}
