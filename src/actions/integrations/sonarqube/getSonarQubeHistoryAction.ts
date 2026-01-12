"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeGetSonarQubeHistoryUseCase } from "@/useCases/integration/sonarqube/factories/makeGetSonarQubeHistoryUseCase";

export async function getSonarQubeHistoryAction(projectSlug: string) {
  const session = await auth();
  if (!session?.user) {
    throw new AppError("Não autorizado.");
  }

  try {
    const useCase = makeGetSonarQubeHistoryUseCase();
    const data = await useCase.execute(projectSlug);

    return { success: true, data };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
