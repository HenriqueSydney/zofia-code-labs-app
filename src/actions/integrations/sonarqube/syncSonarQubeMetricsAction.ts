"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeSyncSonarQubeMetricsUseCase } from "@/useCases/integration/sonarqube/factories/makeSyncSonarQubeMetricsUseCase";

export async function syncSonarQubeMetricsAction(projectSlug: string) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new AppError("Não autorizado.");
  }

  try {
    const useCase = makeSyncSonarQubeMetricsUseCase();

    const metrics = await useCase.execute(projectSlug, session.user.id);

    return { success: true, data: metrics };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
