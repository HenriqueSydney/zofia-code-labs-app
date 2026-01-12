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
}
