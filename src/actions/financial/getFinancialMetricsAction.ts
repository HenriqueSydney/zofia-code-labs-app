"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeGetFinancialMetricsUseCase } from "@/useCases/financial/factories/makeGetFinancialMetricsUseCase";

export async function getFinancialMetricsAction(projectSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado." };
  }

  try {
    const useCase = makeGetFinancialMetricsUseCase();
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
