"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetSonarQubeIssueAndQualityGateUseCase } from "@/useCases/integration/sonarqube/factories/makeGetSonarQubeIssueAndQualityGateUseCase";

export async function getSonarQubeIssueAndQualityGateAction(
  projectSlug: string
) {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError("unauthorized");
  }
  try {
    const useCase = makeGetSonarQubeIssueAndQualityGateUseCase();

    const data = await useCase.execute(projectSlug, session.user.id);

    return { success: true, data };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
