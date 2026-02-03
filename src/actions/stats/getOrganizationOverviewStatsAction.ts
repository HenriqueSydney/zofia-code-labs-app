"use server";

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
      message: "Usuário não autenticado.",
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
      message: error.message || "Erro ao carregar estatísticas do dashboard.",
      data: null,
    };
  }
}
