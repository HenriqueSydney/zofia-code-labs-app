"use server";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { resolveActionErrorMessage } from "@/errors/resolveActionErrorMessage";
import { makeGetPaymentGatewaysAvailableIntegrationsUseCase } from "@/useCases/integration/paymentGateways/factories/makeGetPaymentGatewaysAvailableIntegrationsUseCase";

export async function getPaymentGatewaysAvailableIntegrations() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new UnauthorizedError("sessionExpired");
  }

  try {
    const useCase = makeGetPaymentGatewaysAvailableIntegrationsUseCase();
    const integrations = await useCase.execute({
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });
    return integrations;
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
