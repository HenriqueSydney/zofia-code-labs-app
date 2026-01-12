"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeGetSprintMetricsUseCase } from "@/useCases/sprint/factories/makeGetSprintMetricsUseCase";

export async function getSprintMetricsAction(projectSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    const useCase = makeGetSprintMetricsUseCase();
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
