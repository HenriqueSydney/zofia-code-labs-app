import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IOrganizationIntegrationRepository } from "@/repositories/IOrganizationIntegrationRepository";

interface IGetPaymentGatewaysAvailableIntegrationsUseCase {
  userId: string;
  organizationId: string;
}

export class GetPaymentGatewaysAvailableIntegrationsUseCase {
  constructor(
    private organizationIntegrationRepository: IOrganizationIntegrationRepository,
  ) {}

  async execute({
    userId,
    organizationId,
  }: IGetPaymentGatewaysAvailableIntegrationsUseCase) {
    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { organizationId },
      "CREATE",
    );

    const integrations =
      await this.organizationIntegrationRepository.findManyByTags(
        organizationId,
        "PAYMENT_GATEWAY",
      );

    return integrations;
  }
}
