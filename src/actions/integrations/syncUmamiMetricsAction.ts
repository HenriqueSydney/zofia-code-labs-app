"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeSyncUmamiMetricsUseCase } from "@/useCases/integration/factories/makeSyncUmamiMetricsUseCase";

export async function syncUmamiMetricsAction(projectSlug: string) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new AppError("Não autorizado.");
  }

  try {
    const useCase = makeSyncUmamiMetricsUseCase();

    const metrics = await useCase.execute(projectSlug, session.user.id);

    return { success: true, data: metrics };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
