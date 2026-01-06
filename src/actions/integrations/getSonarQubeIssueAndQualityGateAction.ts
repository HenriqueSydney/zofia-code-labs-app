"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeGetSonarQubeIssueAndQualityGateUseCase } from "@/useCases/integration/factories/makeGetSonarQubeIssueAndQualityGateUseCase";

export async function getSonarQubeIssueAndQualityGateAction(projectSlug: string) {
  const session = await auth();

  if (!session?.user) {
    throw new AppError("Não autorizado.");
  }
  try {
    const useCase = makeGetSonarQubeIssueAndQualityGateUseCase();

    const data = await useCase.execute(projectSlug, session.user.id);

    return { success: true, data };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
