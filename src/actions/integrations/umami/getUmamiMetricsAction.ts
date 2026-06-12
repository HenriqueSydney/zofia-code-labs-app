"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeGetUmamiMetricsUseCase } from "@/useCases/integration/umami/factories/makeGetUmamiMetricsUseCase";

export async function getUmamiMetricsAction(projectSlug: string) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    throw new UnauthorizedError("unauthorized");
  }

  try {
    const useCase = makeGetUmamiMetricsUseCase();

    const metrics = await useCase.execute({
      projectSlug,
      userId: session.user.id,
    });

    return { success: true, data: metrics };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
