"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetOrganizationOverviewStatsUseCase } from "@/useCases/stats/factories/makeGetOrganizationOverviewStatsUseCase";

/**
 * Action para buscar os Cards de Estatísticas (Topo do Dashboard)
 */
export async function getOrganizationOverviewStatsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: await serverErrorMessage("unauthenticated"),
      data: null,
    };
  }

  try {
    const useCase = makeGetOrganizationOverviewStatsUseCase();

    const stats = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas gerais:", error);
    return {
      success: false,
      message: error.message || await serverErrorMessage("dashboardStatsFailed"),
      data: null,
    };
  }
}
