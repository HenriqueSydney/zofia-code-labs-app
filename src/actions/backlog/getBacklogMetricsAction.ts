"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeGetBacklogMetricsUseCase } from "@/useCases/backlog/factories/makeGetBacklogMetricsUseCase";

export async function getBacklogMetricsAction(projectSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    const useCase = makeGetBacklogMetricsUseCase();
    const data = await useCase.execute({
      userId: session.user.id,
      projectSlug,
    });

    return { success: true, data };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
