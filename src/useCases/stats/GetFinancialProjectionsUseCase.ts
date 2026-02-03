// useCases/financial/GetFinancialProjectionsUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";
import { formatCurrency } from "@/utils/formatCurrency";

interface IRequest {
  organizationId: string;
  userId: string;
}

export class GetFinancialProjectionsUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId }: IRequest) {
    const { projectedRevenue, projectedExpenses } =
      await this.statsRepo.getFinancialProjections(organizationId);

    const projectedProfit = projectedRevenue - projectedExpenses;

    return {
      revenue: formatCurrency(projectedRevenue),
      expenses: formatCurrency(projectedExpenses),
      profit: formatCurrency(projectedProfit),
      isProfitPositive: projectedProfit >= 0,
      // Poderia adicionar lista detalhada aqui se o repositório suportasse
    };
  }
}
