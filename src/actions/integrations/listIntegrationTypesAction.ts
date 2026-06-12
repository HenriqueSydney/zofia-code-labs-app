"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeListIntegrationTypeUseCase } from "@/useCases/integration/factories/makeListIntegrationTypeUseCase";

export async function listIntegrationTypesAction(query?: string) {
  try {
    const session = await auth();

    // Aqui você verificaria se o usuário é o ADMIN do sistema
    if (!session?.user) {
      throw new UnauthorizedError("unauthorized");
    }
    const useCase = makeListIntegrationTypeUseCase();
    const integrations = await useCase.execute(
      session.user.id,
      session.user.organizationId,
      query,
    );

    return { success: true, data: integrations };
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
