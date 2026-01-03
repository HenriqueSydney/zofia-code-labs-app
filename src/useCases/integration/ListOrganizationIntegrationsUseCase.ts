import { OrganizationIntegration } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";

export class ListOrganizationIntegrationsUseCase {
  constructor(private repository: IOrganizationIntegrationRepository) {}

  async execute(
    organizationId: string,
    userId: string
  ): Promise<OrganizationIntegration[]> {
    await checkUserPermissionForAsset(
      "organizationIntegration",
      userId,
      { organizationId },
      "READ"
    );
    return await this.repository.listByOrganization(organizationId);
  }
}
