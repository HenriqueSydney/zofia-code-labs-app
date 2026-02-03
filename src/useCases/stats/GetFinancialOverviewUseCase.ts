// useCases/financial/GetFinancialOverviewUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";
import { formatCurrency } from "@/utils/formatCurrency"; // Assumindo seu utilitário

interface IRequest {
  organizationId: string;
  userId: string;
}

export class GetFinancialOverviewUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId }: IRequest) {
    // 1. Busca dados brutos
    const stats = await this.statsRepo.getFinancialOverview(organizationId);

    // 2. Formata para a View (ViewModel)
    // O frontend espera strings formatadas para os Cards
    return {
      cards: [
        {
          title: "Receita Total",
          value: formatCurrency(stats.revenue.total),
          trend: `${stats.revenue.trend > 0 ? "+" : ""}${stats.revenue.trend}%`,
          trendUp: stats.revenue.trend >= 0,
          description: "Últimos 12 meses",
          iconKey: "DollarSign",
        },
        {
          title: "Receita Mensal",
          value: formatCurrency(stats.revenue.currentMonth),
          trend: "Mês atual", // Poderia calcular trend mensal x mensal se quisesse
          trendUp: true,
          description: "Referência atual",
          iconKey: "Wallet",
        },
        {
          title: "Despesas",
          value: formatCurrency(stats.expenses.total),
          trend: `${stats.expenses.trend > 0 ? "+" : ""}${stats.expenses.trend}%`,
          trendUp: stats.expenses.trend < 0, // Para despesa, subir (trend > 0) é "ruim" (trendUp false no contexto visual verde/vermelho?)
          // Ajuste: Geralmente UI de finanças: Verde = Bom.
          // Se despesa subiu, é vermelho. Se despesa caiu, é verde.
          // Vamos deixar o front decidir a cor com base no valor.
          description: "Últimos 12 meses",
          iconKey: "TrendingDown",
        },
        {
          title: "Lucro Líquido",
          value: formatCurrency(stats.netProfit.total),
          trend: `${stats.netProfit.trend > 0 ? "+" : ""}${stats.netProfit.trend}%`,
          trendUp: stats.netProfit.trend >= 0,
          description: "Últimos 12 meses",
          iconKey: "TrendingUp",
        },
      ],
      chartData: stats.chartData, // Já vem formatado { month, revenue, expenses }
    };
  }
}
