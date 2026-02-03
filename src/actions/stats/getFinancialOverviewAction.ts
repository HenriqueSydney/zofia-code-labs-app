"use server";

import { auth } from "@/auth";
import { makeGetFinancialOverviewUseCase } from "@/useCases/stats/factories/makeGetFinancialOverviewUseCase";

/**
 * Busca os dados para os Cards Superiores (KPIs) e o Gráfico Principal (Área)
 */
export async function getFinancialOverviewAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Usuário não autenticado.",
      data: null,
    };
  }

  try {
    const useCase = makeGetFinancialOverviewUseCase();
    const data = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Erro ao buscar visão geral financeira:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar dados financeiros.",
      data: null,
    };
  }
}
