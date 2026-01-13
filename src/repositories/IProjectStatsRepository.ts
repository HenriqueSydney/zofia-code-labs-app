import { BacklogStatus } from "@/generated/prisma/enums";

// repositories/IProjectStatsRepository.ts
export interface IProjectStatsRepository {
  // Para os StatsCards e Donut de Backlog
  getBacklogMetrics(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    statusDistribution: { status: BacklogStatus; count: number }[];
    trends: any; // Comparativo com período anterior
  }>;

  // Para o Burndown e Barra de Sprints
  getSprintMetrics(projectId: string): Promise<{
    currentSprintBurndown: { day: string; ideal: number; real: number }[];
    sprintHistory: { name: string; planned: number; completed: number }[];
  }>;

  // Para o LineChart de Receitas/Despesas e Cards Financeiros
  getFinancialMetrics(projectId: string): Promise<{
    totalReceived: number;
    totalExpenses: number;
    monthlyHistory: { month: string; revenue: number; expenses: number }[];
    trends: any;
  }>;

  getCommercialMetrics(projectId: string): Promise<{
    proposals: {
      count: number; // Total de propostas
      openValue: number; // Valor em negociação (DRAFT, REVIEW, SENT)
      wonValue: number; // Valor ganho (APPROVED, ACCEPTED)
    };
    contracts: {
      activeCount: number; // Contratos assinados/ativos
      totalValue: number; // Soma do valor das propostas vinculadas aos contratos ativos
    };
    financials: {
      netResult: number;
      totalReceived: number;
      profitMargin: number; // (Receita - Despesa) / Receita
    };
  }>;
}
