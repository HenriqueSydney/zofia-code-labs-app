"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeGetGitHubMetricsUseCase } from "@/useCases/integration/gitub/factories/makeGetGitHubMetricsUseCase";

export async function getGitHubMetricsAction(projectSlug: string) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new AppError("Não autorizado.");
  }

  try {
    const useCase = makeGetGitHubMetricsUseCase();

    const metrics = await useCase.execute({
      projectSlug,
      userId: session.user.id,
    });

    return { success: true, data: metrics.metrics };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
