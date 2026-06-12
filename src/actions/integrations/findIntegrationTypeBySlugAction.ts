"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeFindIntegrationTypeBySlugUseCase } from "@/useCases/integration/factories/makeFindIntegrationTypeBySlugUseCase";

export async function findIntegrationTypeBySlugAction(slug: string) {
  try {
    const session = await auth();

    // Aqui você verificaria se o usuário é o ADMIN do sistema
    if (!session?.user?.organizationId) {
      throw new UnauthorizedError("sessionExpiredNoOrg");
    }
    const useCase = makeFindIntegrationTypeBySlugUseCase();
    const integrations = await useCase.execute(
      session.user.id,
      session.user.organizationId,
      slug,
    );

    return { success: true, data: integrations };
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
