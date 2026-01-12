import { prisma } from "@/lib/prisma";
import { IProjectStatsRepository } from "../IProjectStatsRepository";
import { BacklogStatus, FinancialStatus } from "@/generated/prisma/enums";
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

    const [
      revenueSum,
      expenseSum,
      invoices,
      expenses,
      prevRevenue,
      prevExpense,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { projectId, status: FinancialStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { projectId },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { projectId, status: FinancialStatus.PAID },
        orderBy: { createdAt: "asc" },
      }),
      prisma.expense.findMany({
        where: { projectId },
        orderBy: { date: "asc" },
      }),
      // Agregações para tendências
      prisma.invoice.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          createdAt: { gte: thirtyDaysAgo, lte: now },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          projectId,
          status: FinancialStatus.PAID,
          createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { projectId, date: { gte: thirtyDaysAgo, lte: now } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { projectId, date: { gte: sixtyDaysAgo, lte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
    ]);

    // O retorno das agregações no aggregate vem em array pela ordem do Promise.all
    // Para simplificar, usei variáveis explícitas abaixo:
    const currentRevValue = Number(prevRevenue._sum.amount || 0);
    const previousRevValue = Number(prevExpense._sum.amount || 0); // Ajuste de nomeclatura na lógica

    return {
      totalReceived: Number(revenueSum._sum.amount || 0),
      totalExpenses: Number(expenseSum._sum.amount || 0),
      monthlyHistory: this.groupFinancialsByMonth(invoices, expenses),
      trends: {
        received: this.calculatePercentageChange(
          Number(prevRevenue._sum.amount || 0),
          Number(prevExpense._sum.amount || 0)
        ),
        expenses: this.calculatePercentageChange(
          Number(prevRevenue._sum.amount || 0),
          Number(prevExpense._sum.amount || 0)
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

  private groupFinancialsByMonth(invoices: any[], expenses: any[]) {
    const history: Record<
      string,
      { month: string; revenue: number; expenses: number }
    > = {};

    invoices.forEach((inv) => {
      // Formata o mês usando as capacidades do Dayjs
      const monthLabel = date(inv.createdAt).format("MMM");
      if (!history[monthLabel])
        history[monthLabel] = { month: monthLabel, revenue: 0, expenses: 0 };
      history[monthLabel].revenue += Number(inv.amount);
    });

    expenses.forEach((exp) => {
      const monthLabel = date(exp.date).format("MMM");
      if (!history[monthLabel])
        history[monthLabel] = { month: monthLabel, revenue: 0, expenses: 0 };
      history[monthLabel].expenses += Number(exp.amount);
    });

    return Object.values(history);
  }

  private calculatePercentageChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
