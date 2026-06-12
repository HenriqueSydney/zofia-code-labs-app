"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetSonarQubeHistoryUseCase } from "@/useCases/integration/sonarqube/factories/makeGetSonarQubeHistoryUseCase";

export async function getSonarQubeHistoryAction(projectSlug: string) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("unauthorized");
  }

  try {
    const useCase = makeGetSonarQubeHistoryUseCase();
    const data = await useCase.execute(projectSlug);

    return { success: true, data };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
