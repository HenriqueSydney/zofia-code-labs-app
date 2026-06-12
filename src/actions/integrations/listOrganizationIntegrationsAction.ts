"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeListOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeListOrganizationTypeUseCase";

/**
 * Esta Action recupera todas as integrações configuradas para a organização
 * do usuário logado.
 */
export async function listOrganizationIntegrationsAction() {
  // 1. Autenticação e extração do ID da organização
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new UnauthorizedError("sessionExpiredNoOrg");
  }

  try {
    // 2. Instanciação do Use Case via Factory
    const useCase = makeListOrganizationIntegrationUseCase();

    // 3. Execução da lógica de negócio
    const integrations = await useCase.execute(organizationId, session.user.id);

    // 4. Retorno dos dados (incluindo o 'integrationType' que o repositório já traz)
    return {
      success: true,
      data: integrations,
    };
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
