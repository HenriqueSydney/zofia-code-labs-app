"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetGitHubMetricsUseCase } from "@/useCases/integration/gitub/factories/makeGetGitHubMetricsUseCase";

export async function getGitHubMetricsAction(projectSlug: string) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new UnauthorizedError("unauthorized");
  }

  try {
    const useCase = makeGetGitHubMetricsUseCase();

    const metrics = await useCase.execute({
      projectSlug,
      userId: session.user.id,
    });

    return { success: true, data: metrics.metrics };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
