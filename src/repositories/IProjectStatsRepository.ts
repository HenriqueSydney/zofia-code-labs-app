import {
  BacklogStatus,
  FinancialStatus,
  ProjectHealth,
  ProjectStatus,
} from "@/generated/prisma/enums";

export interface DashboardStats {
  totalProjects: { value: number; trend: number };
  activeProjects: { value: number; trend: number };
  completedProjects: { value: number; trend: number };
  clientSatisfaction: { value: number; trend: number }; // Baseado no ProjectHealth
}

export interface ProjectVolumeData {
  month: string;
  projects: number;
}

export interface RecentProjectDTO {
  id: string;
  name: string;
  clientName: string;
  clientLogo?: string | null;
  status: ProjectStatus;
  health: ProjectHealth;
  date: Date;
  endDate: Date | null;
  budget: number;
}

export interface FinancialStats {
  revenue: { total: number; trend: number; currentMonth: number };
  expenses: { total: number; trend: number; currentMonth: number };
  netProfit: { total: number; trend: number };
  chartData: { month: string; revenue: number; expenses: number }[];
}

export interface FinancialTransaction {
  id: string;
  date: Date;
  description: string;
  type: "income" | "expense";
  amount: number;
  categoryOrClient: string; // Nome do Cliente (Receita) ou Categoria (Despesa)
  projectName: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface PendingPaymentDTO {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  dueDate: Date;
  daysOverdue: number;
  status: FinancialStatus;
}

export interface CategoryChartData {
  name: string;
  value: number;
  color?: string; // Opcional, geralmente decidido no front
}

// repositories/IProjectStatsRepository.ts
export interface IProjectStatsRepository {
  // ===========================================================================
  // DASHBOARD PRINCIPAL (Nível Organização/Software House)
  // ===========================================================================
  getDashboardStats(organizationId: string): Promise<DashboardStats>;
  getProjectsVolumeChart(organizationId: string): Promise<ProjectVolumeData[]>;
  getRecentProjects(organizationId: string): Promise<RecentProjectDTO[]>;
  getOrganizationBacklogEvolution(
    organizationId: string,
  ): Promise<{ month: string; created: number; completed: number }[]>;

  // ===========================================================================
  // DASHBOARD FINANCEIRO (ORGANIZAÇÃO)
  // ===========================================================================

  /**
   * Busca os Cards (KPIs) e o Gráfico de Área (Receita vs Despesa)
   * Baseado em paidAt (Regime de Caixa)
   */
  getFinancialOverview(organizationId: string): Promise<FinancialStats>;

  /**
   * Busca lista unificada de Receitas e Despesas para a tabela
   */
  getRecentTransactions(
    organizationId: string,
    limit?: number,
  ): Promise<FinancialTransaction[]>;

  /**
   * Busca faturas pendentes ou atrasadas
   */
  getPendingSettlements(organizationId: string): Promise<PendingPaymentDTO[]>;

  /**
   * Busca distribuição de despesas por Categoria (Pie Chart)
   */
  getExpensesByCategory(organizationId: string): Promise<CategoryChartData[]>;

  /**
   * Projeção simples baseada em itens agendados/pendentes futuros
   */
  getFinancialProjections(organizationId: string): Promise<{
    projectedRevenue: number;
    projectedExpenses: number;
  }>;
  // ===========================================================================
  // DASHBOARD DE PROJETO (Nível Projeto Individual)
  // ===========================================================================
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
