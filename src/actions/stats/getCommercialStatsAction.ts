"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetCommercialStatsUseCase } from "@/useCases/stats/factories/makeGetCommercialStatsUseCase";
export async function getCommercialStatsAction(projectSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: await serverErrorMessage("unauthenticated"),
      data: null,
    };
  }

  try {
    const useCase = makeGetCommercialStatsUseCase();

    const stats = await useCase.execute({
      projectSlug,
      userId: session.user.id,
    });

    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas comerciais:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar dados comerciais.",
      data: null,
    };
  }
}
