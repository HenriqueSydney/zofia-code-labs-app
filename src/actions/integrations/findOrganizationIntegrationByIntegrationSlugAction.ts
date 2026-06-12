"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeFindOrganizationIntegrationByIntegrationSlugUseCase } from "@/useCases/integration/factories/makeFindOrganizationIntegrationByIntegrationSlugUseCase";

export async function findOrganizationIntegrationByIntegrationSlugAction(
  integrationSlug: string
) {
  // 1. Autenticação e extração do ID da organização
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new UnauthorizedError("sessionExpiredNoOrg");
  }

  try {
    // 2. Instanciação do Use Case via Factory
    const useCase = makeFindOrganizationIntegrationByIntegrationSlugUseCase();

    // 3. Execução da lógica de negócio
    const integration = await useCase.execute(
      organizationId,
      session.user.id,
      integrationSlug
    );

    // 4. Retorno dos dados (incluindo o 'integrationType' que o repositório já traz)
    return {
      success: true,
      data: integration,
    };
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
