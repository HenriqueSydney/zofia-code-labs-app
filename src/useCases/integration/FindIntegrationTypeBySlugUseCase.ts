import { IntegrationType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";

export class FindIntegrationTypeBySlugUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute(
    userId: string,
    organizationId: string,
    slug: string,
  ): Promise<IntegrationType | null> {
    await checkUserPermissionForAsset(
      "integrationType",
      userId,
      { organizationId },
      "READ",
    );

    return await this.repository.findBySlug(slug);
  }
}
