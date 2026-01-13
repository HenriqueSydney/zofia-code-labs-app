import { prisma } from "@/lib/prisma";
import { IProjectStatsRepository } from "../IProjectStatsRepository";
import {
  BacklogStatus,
  ContractStatus,
  FinancialStatus,
  ProposalStatus,
} from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs"; // Utilizando seu utilitário dayjs

export class PrismaProjectStatsRepository implements IProjectStatsRepository {
  async getBacklogMetrics(projectId: string) {
    const distribution = await prisma.backlogItem.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { status: true },
    });

    const totalTasks = distribution.reduce(
      (acc, curr) => acc + curr._count.status,
      0
    );
    const completedTasks =
      distribution.find((d) => d.status === BacklogStatus.DONE)?._count
        .status || 0;

    // Datas para comparação de períodos
    const now = date().toDate();
    const thirtyDaysAgo = date().subtract(30, "day").toDate();
    const sixtyDaysAgo = date().subtract(60, "day").toDate();

    // Consultas em paralelo para performance
    const [currentTasks, previousTasks, currentDone, previousDone] =
      await Promise.all([
        prisma.backlogItem.count({
          where: { projectId, createdAt: { gte: thirtyDaysAgo, lte: now } },
        }),
        prisma.backlogItem.count({
          where: {
            projectId,
            createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo },
          },
        }),
        prisma.backlogItem.count({
          where: {
            projectId,
            status: BacklogStatus.DONE,
            updatedAt: { gte: thirtyDaysAgo, lte: now },
          },
        }),
        prisma.backlogItem.count({
          where: {
            projectId,
            status: BacklogStatus.DONE,
            updatedAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo },
          },
        }),
      ]);

    return {
      totalTasks,
      completedTasks,
      statusDistribution: distribution.map((d) => ({
        status: d.status,
        count: d._count.status,
      })),
      trends: {
        tasks: this.calculatePercentageChange(currentTasks, previousTasks),
        completed: this.calculatePercentageChange(currentDone, previousDone),
      },
    };
  }

  async getSprintMetrics(projectId: string) {
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: "asc" },
      include: { backlogItems: true },
    });

    const activeSprint =
      sprints.find((s) => {
        const now = date();
        // Verifica se o momento atual está entre o início e fim da sprint
        return date(s.startDate).isBefore(now) && date(s.endDate).isAfter(now);
      }) || sprints[sprints.length - 1];

    return {
      currentSprintBurndown: activeSprint
        ? this.calculateBurndown(activeSprint)
        : [],
      sprintHistory: sprints.map((s) => ({
        name: s.name,
        planned: s.totalPoints ?? 0,
        completed: s.backlogItems
          .filter((t) => t.status === BacklogStatus.DONE)
          .reduce((acc, curr) => acc + (curr.points ?? 0), 0),
      })),
    };
  }

  async getFinancialMetrics(projectId: string) {
    const now = date().toDate();
    const thirtyDaysAgo = date().subtract(30, "day").toDate();
    const sixtyDaysAgo = date().subtract(60, "day").toDate();

    // Pega o início do dia de 1 ano atrás para o gráfico
    const oneYearAgo = date().subtract(1, "year").startOf("day").toDate();

    const [
      revenueSum,
      expenseSum,
      invoices,
      expenses,
      // Tendências (Baseadas em DATA DE PAGAMENTO)
      revenueCurrentMonth,
      revenuePreviousMonth,
      expenseCurrentMonth,
      expensePreviousMonth,
    ] = await Promise.all([
      // 1. Total Recebido (Global - Status Pago)
      prisma.invoice.aggregate({
        where: { projectId, status: FinancialStatus.PAID },
        _sum: { amount: true },
      }),
      // 2. Total Gasto (Global - Status Pago) - *Importante filtrar pagos para fluxo de caixa real*
      prisma.expense.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
        },
        _sum: { amount: true },
      }),

      // 3. Lista de Invoices (Últimos 12 meses pelo PAID_AT)
      prisma.invoice.findMany({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          paidAt: { gte: oneYearAgo, not: null }, // Filtra pela data de recebimento
        },
        orderBy: { paidAt: "asc" },
      }),

      // 4. Lista de Expenses (Últimos 12 meses pelo PAID_AT)
      prisma.expense.findMany({
        where: {
          projectId,
          status: FinancialStatus.PAID, // Apenas despesas pagas aparecem no fluxo realizado
          paidAt: { gte: oneYearAgo, not: null }, // Filtra pela data de pagamento
        },
        orderBy: { paidAt: "asc" },
      }),

      // --- TENDÊNCIAS (Comparando fluxo de caixa de 30 dias) ---

      // 5. Receita Recente (0-30 dias pelo paidAt)
      prisma.invoice.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          paidAt: { gte: thirtyDaysAgo, lte: now },
        },
        _sum: { amount: true },
      }),
      // 6. Receita Anterior (30-60 dias pelo paidAt)
      prisma.invoice.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          paidAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      // 7. Despesa Recente (0-30 dias pelo paidAt)
      prisma.expense.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          paidAt: { gte: thirtyDaysAgo, lte: now },
        },
        _sum: { amount: true },
      }),
      // 8. Despesa Anterior (30-60 dias pelo paidAt)
      prisma.expense.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          paidAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
    ]);

    const currentRevValue = Number(revenueCurrentMonth._sum.amount || 0);
    const previousRevValue = Number(revenuePreviousMonth._sum.amount || 0);

    const currentExpValue = Number(expenseCurrentMonth._sum.amount || 0);
    const previousExpValue = Number(expensePreviousMonth._sum.amount || 0);
    const totalReceived = Number(revenueSum._sum.amount || 0);
    const totalExpenses = Number(expenseSum._sum.amount || 0);
    const netResult = totalReceived - totalExpenses;
    return {
      totalReceived: Number(revenueSum._sum.amount || 0),
      totalExpenses: Number(expenseSum._sum.amount || 0),
      netResult,
      monthlyHistory: this.groupFinancialsByMonth(invoices, expenses),
      trends: {
        received: this.calculatePercentageChange(
          currentRevValue,
          previousRevValue
        ),
        expenses: this.calculatePercentageChange(
          currentExpValue,
          previousExpValue
        ),
      },
    };
  }

  private calculateBurndown(sprint: any) {
    const start = date(sprint.startDate);
    const end = date(sprint.endDate);
    const totalPoints = sprint.totalPoints ?? 0;

    // Calcula a diferença em dias usando Dayjs
    const totalDays = end.diff(start, "day");

    const burndown = [];

    for (let i = 0; i <= totalDays; i++) {
      const currentDay = start.add(i, "day");
      const ideal = totalPoints - (totalPoints / totalDays) * i;

      const pointsDoneThisDay = sprint.backlogItems
        .filter(
          (t: any) =>
            t.status === BacklogStatus.DONE &&
            date(t.updatedAt).isBefore(currentDay.endOf("day")) // Garante inclusão de tudo feito no dia
        )
        .reduce((acc: number, curr: any) => acc + (curr.points ?? 0), 0);

      burndown.push({
        day: `Dia ${i + 1}`,
        ideal: Math.max(0, Math.round(ideal)),
        real: Math.max(0, totalPoints - pointsDoneThisDay),
      });
    }
    return burndown;
  }

  async getCommercialMetrics(projectId: string) {
    const proposals = await prisma.proposal.findMany({
      where: { projectId, isActive: true, isCurrent: true },
      select: { status: true, totalValue: true },
    });

    const proposalStats = proposals.reduce(
      (acc, curr) => {
        const val = Number(curr.totalValue);
        acc.count++;

        // CORREÇÃO: Casting do array para (ProposalStatus[]) para o TypeScript não reclamar
        const openStatuses = [
          ProposalStatus.DRAFT,
          ProposalStatus.REVIEW,
          ProposalStatus.SENT,
        ] as ProposalStatus[];

        if (openStatuses.includes(curr.status)) {
          acc.openValue += val;
        }

        // CORREÇÃO: Casting do array para (ProposalStatus[])
        const wonStatuses = [
          ProposalStatus.APPROVED,
          ProposalStatus.ACCEPTED,
        ] as ProposalStatus[];

        if (wonStatuses.includes(curr.status)) {
          acc.wonValue += val;
        }
        return acc;
      },
      { count: 0, openValue: 0, wonValue: 0 }
    );

    const contracts = await prisma.contract.findMany({
      where: {
        projectId,
        isActive: true,
        isCurrent: true,
        // CORREÇÃO: Casting para garantir que o array seja ContractStatus[]
        status: {
          in: [ContractStatus.SIGNED, ContractStatus.SENT] as ContractStatus[],
        },
      },
      include: {
        proposal: {
          select: { totalValue: true },
        },
      },
    });

    const contractStats = contracts.reduce(
      (acc, curr) => {
        acc.activeCount++;
        acc.totalValue += Number(curr.proposal.totalValue);
        return acc;
      },
      { activeCount: 0, totalValue: 0 }
    );

    // Agora o getFinancialMetrics retorna netResult, então não dará erro
    const financialMetrics = await this.getFinancialMetrics(projectId);

    const margin =
      financialMetrics.totalReceived > 0
        ? (financialMetrics.netResult / financialMetrics.totalReceived) * 100
        : 0;

    return {
      proposals: {
        count: proposalStats.count,
        openValue: proposalStats.openValue,
        wonValue: proposalStats.wonValue,
      },
      contracts: {
        activeCount: contractStats.activeCount,
        totalValue: contractStats.totalValue,
      },
      financials: {
        totalReceived: financialMetrics.totalReceived,
        netResult: financialMetrics.netResult,
        profitMargin: Number(margin.toFixed(2)),
      },
    };
  }

  private groupFinancialsByMonth(invoices: any[], expenses: any[]) {
    const historyMap = new Map<
      string,
      { revenue: number; expenses: number; sortDate: number }
    >();

    // 1. Agrupar Receitas por Mês
    invoices.forEach((invoice) => {
      if (!invoice.paidAt) return;

      const monthKey = date(invoice.paidAt).format("MMM/YYYY").toLowerCase(); // ex: 'nov'
      const sortKey = Number(date(invoice.paidAt).format("YYYYMM")); // ex: 202311

      const current = historyMap.get(monthKey) || {
        revenue: 0,
        expenses: 0,
        sortDate: sortKey,
      };

      historyMap.set(monthKey, {
        ...current,
        revenue: current.revenue + Number(invoice.amount),
      });
    });

    // 2. Agrupar Despesas por Mês
    expenses.forEach((expense) => {
      if (!expense.paidAt) return;

      const monthKey = date(expense.paidAt).format("MMM/YYYY").toLowerCase();
      const sortKey = Number(date(expense.paidAt).format("YYYYMM"));

      const current = historyMap.get(monthKey) || {
        revenue: 0,
        expenses: 0,
        sortDate: sortKey,
      };

      historyMap.set(monthKey, {
        ...current,
        expenses: current.expenses + Number(expense.amount),
      });
    });

    // 3. Ordenar Cronologicamente
    const sortedData = Array.from(historyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        sortDate: data.sortDate,
      }))
      .sort((a, b) => a.sortDate - b.sortDate);

    // 4. Lógica de Acumulação (NOVO)
    let accumulatedRevenue = 0;
    let accumulatedExpenses = 0;

    const accumulatedData = sortedData.map((item) => {
      // Soma o valor do mês atual ao acumulador
      accumulatedRevenue += item.revenue;
      accumulatedExpenses += item.expenses;

      return {
        month: item.month,
        // Retorna o valor acumulado em vez do valor do mês
        revenue: accumulatedRevenue,
        expenses: accumulatedExpenses,
        // Mantemos os valores originais 'monthlyRevenue' caso queira mostrar no tooltip (opcional)
        monthlyRevenue: item.revenue,
        monthlyExpenses: item.expenses,
      };
    });

    return accumulatedData;
  }

  private calculatePercentageChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
