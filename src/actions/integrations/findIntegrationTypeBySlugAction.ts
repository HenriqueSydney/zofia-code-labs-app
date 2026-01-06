"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeFindIntegrationTypeBySlugUseCase } from "@/useCases/integration/factories/makeFindIntegrationTypeBySlugUseCase";

export async function findIntegrationTypeBySlugAction(slug: string) {
  try {
    const session = await auth();

    // Aqui você verificaria se o usuário é o ADMIN do sistema
    if (!session?.user) {
      throw new AppError("Não autorizado.");
    }
    const useCase = makeFindIntegrationTypeBySlugUseCase();
    const integrations = await useCase.execute(session.user.id, slug);

    return { success: true, data: integrations };
  } catch (error) {
    handleErrors(error);
    throw error;
  }
}
