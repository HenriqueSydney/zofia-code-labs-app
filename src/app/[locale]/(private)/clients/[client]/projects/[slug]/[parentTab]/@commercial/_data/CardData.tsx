"use server";

import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { makeGetCommercialStatsUseCase } from "@/useCases/stats/factories/makeGetCommercialStatsUseCase";

// Interface para tipar o retorno
export interface CommercialMetrics {
  proposals: {
    totalValue: number;
    count: number;
    openValue: number; // Apenas as em aberto/negociação
  };
  contracts: {
    totalValue: number; // Valor total dos contratos fechados
    activeCount: number;
  };
  financials: {
    totalReceived: number;
    totalExpenses: number;
    netResult: number;
    profitMargin: number;
  };
}

export const getCommercialStats = cache(
  async (projectSlug: string, userId: string) => {
    const useCase = makeGetCommercialStatsUseCase();

    // Aqui chamamos a lógica REAL que vai no banco via PrismaProjectStatsRepository
    const stats = await useCase.execute({
      projectSlug,
      userId,
    });

    return stats;
  }
);
