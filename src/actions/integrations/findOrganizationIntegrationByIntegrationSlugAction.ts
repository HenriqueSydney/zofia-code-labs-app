"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeFindOrganizationIntegrationByIntegrationSlugUseCase } from "@/useCases/integration/factories/makeFindOrganizationIntegrationByIntegrationSlugUseCase";

export async function findOrganizationIntegrationByIntegrationSlugAction(
  integrationSlug: string
) {
  // 1. Autenticação e extração do ID da organização
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new AppError("Sessão expirada ou organização não encontrada.");
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
    handleErrors(error);
    throw error;
  }
}
