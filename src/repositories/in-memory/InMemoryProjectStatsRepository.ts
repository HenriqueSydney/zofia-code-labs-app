import { date } from "../../lib/dayjs";
import {
  CategoryChartData,
  DashboardStats,
  FinancialStats,
  FinancialTransaction,
  IProjectStatsRepository,
  PendingPaymentDTO,
  ProjectVolumeData,
  RecentProjectDTO,
} from "../IProjectStatsRepository";

const zeroTrend = { value: 0, trend: 0 };

function lastSixMonthLabels(): string[] {
  const labels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    labels.push(date().subtract(i, "month").format("MMM"));
  }
  return labels;
}

function lastTwelveMonthChartData(): FinancialStats["chartData"] {
  const chartData: FinancialStats["chartData"] = [];
  for (let i = 11; i >= 0; i--) {
    chartData.push({
      month: date().subtract(i, "month").format("MMM"),
      revenue: 0,
      expenses: 0,
    });
  }
  return chartData;
}

export class InMemoryProjectStatsRepository implements IProjectStatsRepository {
  async getDashboardStats(_organizationId: string): Promise<DashboardStats> {
    return {
      totalProjects: zeroTrend,
      activeProjects: zeroTrend,
      completedProjects: zeroTrend,
      clientSatisfaction: zeroTrend,
    };
  }

  async getProjectsVolumeChart(
    _organizationId: string,
  ): Promise<ProjectVolumeData[]> {
    return lastSixMonthLabels().map((month) => ({ month, projects: 0 }));
  }

  async getRecentProjects(
    _organizationId: string,
  ): Promise<RecentProjectDTO[]> {
    return [];
  }

  async getOrganizationBacklogEvolution(_organizationId: string) {
    return lastSixMonthLabels().map((month) => ({
      month,
      created: 0,
      completed: 0,
    }));
  }

  async getFinancialOverview(
    _organizationId: string,
  ): Promise<FinancialStats> {
    return {
      revenue: { total: 0, trend: 0, currentMonth: 0 },
      expenses: { total: 0, trend: 0, currentMonth: 0 },
      netProfit: { total: 0, trend: 0 },
      chartData: lastTwelveMonthChartData(),
    };
  }

  async getRecentTransactions(
    _organizationId: string,
    _limit?: number,
  ): Promise<FinancialTransaction[]> {
    return [];
  }

  async getPendingSettlements(
    _organizationId: string,
  ): Promise<PendingPaymentDTO[]> {
    return [];
  }

  async getExpensesByCategory(
    _organizationId: string,
  ): Promise<CategoryChartData[]> {
    return [];
  }

  async getFinancialProjections(_organizationId: string) {
    return {
      projectedRevenue: 0,
      projectedExpenses: 0,
    };
  }

  async getBacklogMetrics(_projectId: string) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      statusDistribution: [],
      trends: {
        tasks: 0,
        completed: 0,
      },
    };
  }

  async getSprintMetrics(_projectId: string) {
    return {
      currentSprintBurndown: [],
      sprintHistory: [],
    };
  }

  async getFinancialMetrics(_projectId: string) {
    return {
      totalReceived: 0,
      totalExpenses: 0,
      netResult: 0,
      monthlyHistory: [],
      trends: {
        received: 0,
        expenses: 0,
      },
    };
  }

  async getCommercialMetrics(_projectId: string) {
    return {
      proposals: {
        count: 0,
        openValue: 0,
        wonValue: 0,
      },
      contracts: {
        activeCount: 0,
        totalValue: 0,
      },
      financials: {
        netResult: 0,
        totalReceived: 0,
        profitMargin: 0,
      },
    };
  }
}
