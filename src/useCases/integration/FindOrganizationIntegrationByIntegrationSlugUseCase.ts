import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IOrganizationIntegrationRepository,
  OrganizationIntegrationWithDetails,
} from "@/repositories/IOrganizationIntegrationRepository";

export class FindOrganizationIntegrationByIntegrationSlugUseCase {
  constructor(private repository: IOrganizationIntegrationRepository) {}

  async execute(
    organizationId: string,
    userId: string,
    integrationSlug: string
  ): Promise<OrganizationIntegrationWithDetails | null> {
    const integrationInfo = await this.repository.findByOrgAndSlug(
      organizationId,
      integrationSlug
    );
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      integrationInfo,
      "READ"
    );

    return integrationInfo;
  }
}
