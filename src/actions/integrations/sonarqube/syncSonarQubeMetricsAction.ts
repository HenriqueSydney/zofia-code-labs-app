"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeSyncSonarQubeMetricsUseCase } from "@/useCases/integration/sonarqube/factories/makeSyncSonarQubeMetricsUseCase";

export async function syncSonarQubeMetricsAction(projectSlug: string) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new UnauthorizedError("unauthorized");
  }

  try {
    const useCase = makeSyncSonarQubeMetricsUseCase();

    const metrics = await useCase.execute(projectSlug, session.user.id);

    return { success: true, data: metrics };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
