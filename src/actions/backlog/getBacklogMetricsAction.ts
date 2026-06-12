"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetBacklogMetricsUseCase } from "@/useCases/backlog/factories/makeGetBacklogMetricsUseCase";

export async function getBacklogMetricsAction(projectSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: await serverErrorMessage("unauthorized") };
  }

  try {
    const useCase = makeGetBacklogMetricsUseCase();
    const data = await useCase.execute({
      userId: session.user.id,
      projectSlug,
    });

    return { success: true, data };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
