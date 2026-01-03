"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeListIntegrationTypeUseCase } from "@/useCases/integration/factories/makeListIntegrationTypeUseCase";

export async function listIntegrationTypesAction(query?: string) {
  try {
    const session = await auth();

    // Aqui você verificaria se o usuário é o ADMIN do sistema
    if (!session?.user) {
      throw new AppError("Não autorizado.");
    }
    const useCase = makeListIntegrationTypeUseCase();
    const integrations = await useCase.execute(session.user.id, query);

    return { success: true, data: integrations };
  } catch (error) {
    handleErrors(error);
    throw error;
  }
}
