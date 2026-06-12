import { GetPaymentGatewaysAvailableIntegrationsUseCase } from "../getPaymentGatewaysAvailableIntegrationsUseCase";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";

export function makeGetPaymentGatewaysAvailableIntegrationsUseCase() {
  const organizationIntegrationRepository =
    makeOrganizationIntegrationRepository();
  return new GetPaymentGatewaysAvailableIntegrationsUseCase(
    organizationIntegrationRepository,
  );
}
