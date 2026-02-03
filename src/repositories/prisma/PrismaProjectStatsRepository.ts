import { prisma } from "@/lib/prisma";
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
import {
  BacklogStatus,
  ContractStatus,
  ExpenseStatus,
  FinancialStatus,
  ProjectStatus,
  ProposalStatus,
} from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs"; // Utilizando seu utilitário dayjs

export class PrismaProjectStatsRepository implements IProjectStatsRepository {
  // ===========================================================================
  // MÉTODOS DO DASHBOARD PRINCIPAL (ORGANIZAÇÃO)
  // ===========================================================================

  async getDashboardStats(organizationId: string): Promise<DashboardStats> {
    const now = date();
    const startOfCurrentMonth = now.startOf("month").toDate();
    const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();

    // Definição de Status
    const activeStatuses: ProjectStatus[] = [
      "IN_PROGRESS",
      "PLANNED",
      "REVIEW",
      "WAITING_SIGNATURE",
      "WAITING_DOWN_PAYMENT",
    ];
    const completedStatuses: ProjectStatus[] = [
      "COMPLETED",
      "DELIVERED",
      "FINAL_PAYMENT",
    ];

    const [
      totalCurrent,
      totalLastMonth,
      activeCurrent,
      activeLastMonth,
      completedCurrent,
      completedLastMonth,
      healthOnTrack,
    ] = await Promise.all([
      // 1. Total Projects
      prisma.project.count({ where: { organizationId } }),
      prisma.project.count({
        where: { organizationId, createdAt: { lt: startOfCurrentMonth } },
      }),

      // 2. Active Projects
      prisma.project.count({
        where: { organizationId, status: { in: activeStatuses } },
      }),
      // Estimativa de ativos no mês passado (criados antes do mês atual e que eram ativos)
      prisma.project.count({
        where: {
          organizationId,
          status: { in: activeStatuses },
          createdAt: { lt: startOfCurrentMonth },
        },
      }),

      // 3. Completed Projects
      prisma.project.count({
        where: { organizationId, status: { in: completedStatuses } },
      }),
      prisma.project.count({
        where: {
          organizationId,
          status: { in: completedStatuses },
          updatedAt: { lt: startOfCurrentMonth },
        },
      }),

      // 4. Health Index (Satisfação Proxy)
      prisma.project.count({
        where: { organizationId, health: "ON_TRACK" },
      }),
    ]);

    const totalForHealth = activeCurrent > 0 ? activeCurrent : 1;
    const healthPercentage = Math.round((healthOnTrack / totalForHealth) * 100);

    return {
      totalProjects: {
        value: totalCurrent,
        trend: this.calculatePercentageChange(totalCurrent, totalLastMonth),
      },
      activeProjects: {
        value: activeCurrent,
        trend: this.calculatePercentageChange(activeCurrent, activeLastMonth),
      },
      completedProjects: {
        value: completedCurrent,
        trend: this.calculatePercentageChange(
          completedCurrent,
          completedLastMonth,
        ),
      },
      clientSatisfaction: {
        value: healthPercentage,
        trend: 0, // Poderia ser calculado com histórico de snapshots se existisse
      },
    };
  }

  async getProjectsVolumeChart(
    organizationId: string,
  ): Promise<ProjectVolumeData[]> {
    // Pega os últimos 6 meses
    const sixMonthsAgo = date().subtract(5, "month").startOf("month").toDate();

    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    });

    const volumeMap = new Map<string, number>();
    const result: ProjectVolumeData[] = [];

    // Inicializa o mapa com 0 para os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = date().subtract(i, "month");
      const key = d.format("MMM"); // "Jan", "Fev" (depende do locale do dayjs)
      volumeMap.set(key, 0);
    }

    // Conta os projetos
    projects.forEach((p) => {
      const key = date(p.createdAt).format("MMM");
      if (volumeMap.has(key)) {
        volumeMap.set(key, (volumeMap.get(key) || 0) + 1);
      }
    });

    // Converte para array na ordem correta
    for (let i = 5; i >= 0; i--) {
      const d = date().subtract(i, "month");
      const key = d.format("MMM");
      result.push({ month: key, projects: volumeMap.get(key) || 0 });
    }

    return result;
  }

  async getRecentProjects(organizationId: string): Promise<RecentProjectDTO[]> {
    const projects = await prisma.project.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        health: true,
        endDate: true,
        estimatedStartDate: true,
        startDate: true,
        createdAt: true,
        totalBudget: true,
        client: {
          select: {
            tradeName: true,
            logoReference: true,
          },
        },
      },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.client.tradeName,
      clientLogo: p.client.logoReference,
      status: p.status,
      health: p.health,
      date: p.startDate || p.estimatedStartDate || p.createdAt,
      endDate: p.endDate,
      budget: Number(p.totalBudget),
    }));
  }

  // Implementação na classe PrismaProjectStatsRepository
  async getOrganizationBacklogEvolution(organizationId: string) {
    // Pega os últimos 6 meses
    const sixMonthsAgo = date().subtract(5, "month").startOf("month").toDate();

    // 1. Busca todos os itens criados ou concluídos nos últimos 6 meses
    // Precisamos filtrar por projetos da organização
    const items = await prisma.backlogItem.findMany({
      where: {
        project: { organizationId },
        OR: [
          { createdAt: { gte: sixMonthsAgo } },
          {
            status: BacklogStatus.DONE,
            updatedAt: { gte: sixMonthsAgo },
          },
        ],
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    const evolutionMap = new Map<
      string,
      { created: number; completed: number }
    >();

    // Inicializa meses com 0
    for (let i = 5; i >= 0; i--) {
      const d = date().subtract(i, "month");
      const key = d.format("MMM");
      evolutionMap.set(key, { created: 0, completed: 0 });
    }

    // Processa os dados
    items.forEach((item) => {
      // Contagem de Criados (Input)
      if (date(item.createdAt).isAfter(sixMonthsAgo)) {
        const createdKey = date(item.createdAt).format("MMM");
        if (evolutionMap.has(createdKey)) {
          const entry = evolutionMap.get(createdKey)!;
          entry.created++;
        }
      }

      // Contagem de Concluídos (Output)
      if (
        item.status === BacklogStatus.DONE &&
        date(item.updatedAt).isAfter(sixMonthsAgo)
      ) {
        const completedKey = date(item.updatedAt).format("MMM");
        if (evolutionMap.has(completedKey)) {
          const entry = evolutionMap.get(completedKey)!;
          entry.completed++;
        }
      }
    });

    // Transforma em array
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = date().subtract(i, "month");
      const key = d.format("MMM");
      const entry = evolutionMap.get(key) || { created: 0, completed: 0 };
      result.push({
        month: key,
        created: entry.created,
        completed: entry.completed,
      });
    }

    return result;
  }

  async getFinancialOverview(organizationId: string): Promise<FinancialStats> {
    const now = date();
    const startOfCurrentMonth = now.startOf("month").toDate();
    const startOfLastMonth = now.subtract(1, "month").startOf("month").toDate();
    const endOfLastMonth = now.subtract(1, "month").endOf("month").toDate();
    const oneYearAgo = now.subtract(12, "month").startOf("month").toDate();

    // Queries em Paralelo
    const [
      // 1. Receita Total (12 meses)
      revenueTotal,
      // 2. Receita Mês Atual
      revenueCurrent,
      // 3. Receita Mês Passado (Trend)
      revenueLast,
      // 4. Despesa Total (12 meses)
      expenseTotal,
      // 5. Despesa Mês Atual
      expenseCurrent,
      // 6. Despesa Mês Passado (Trend)
      expenseLast,
      // 7. Lista para Gráfico (12 meses)
      invoicesHistory,
      expensesHistory,
    ] = await Promise.all([
      // Totais (PaidAt >= 1 ano atrás)
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: FinancialStatus.PAID,
          paidAt: { gte: oneYearAgo },
        },
        _sum: { amount: true },
      }),
      // Current Month
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: FinancialStatus.PAID,
          paidAt: { gte: startOfCurrentMonth },
        },
        _sum: { amount: true },
      }),
      // Last Month
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: FinancialStatus.PAID,
          paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Despesas (PaidAt >= 1 ano atrás)
      prisma.expense.aggregate({
        where: {
          organizationId,
          status: ExpenseStatus.PAID,
          paidAt: { gte: oneYearAgo },
        },
        _sum: { amount: true },
      }),
      // Despesa Current Month
      prisma.expense.aggregate({
        where: {
          organizationId,
          status: ExpenseStatus.PAID,
          paidAt: { gte: startOfCurrentMonth },
        },
        _sum: { amount: true },
      }),
      // Despesa Last Month
      prisma.expense.aggregate({
        where: {
          organizationId,
          status: ExpenseStatus.PAID,
          paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Histórico para Gráfico
      prisma.invoice.findMany({
        where: {
          organizationId,
          status: FinancialStatus.PAID,
          paidAt: { gte: oneYearAgo },
        },
        select: { paidAt: true, amount: true },
      }),
      prisma.expense.findMany({
        where: {
          organizationId,
          status: ExpenseStatus.PAID,
          paidAt: { gte: oneYearAgo },
        },
        select: { paidAt: true, amount: true },
      }),
    ]);

    // Parse dos valores
    const rTotal = Number(revenueTotal._sum.amount || 0);
    const rCurrent = Number(revenueCurrent._sum.amount || 0);
    const rLast = Number(revenueLast._sum.amount || 0);

    const eTotal = Number(expenseTotal._sum.amount || 0);
    const eCurrent = Number(expenseCurrent._sum.amount || 0);
    const eLast = Number(expenseLast._sum.amount || 0);

    const netTotal = rTotal - eTotal;
    const netLast = rLast - eLast; // Lucro mês passado para calcular trend do lucro

    // Processar gráfico mensal
    const chartData = this.buildMonthlyChartData(
      invoicesHistory,
      expensesHistory,
    );

    return {
      revenue: {
        total: rTotal,
        currentMonth: rCurrent,
        trend: this.calculatePercentageChange(rCurrent, rLast),
      },
      expenses: {
        total: eTotal,
        currentMonth: eCurrent,
        trend: this.calculatePercentageChange(eCurrent, eLast),
      },
      netProfit: {
        total: netTotal,
        trend: this.calculatePercentageChange(netTotal, netLast), // Trend simplificada
      },
      chartData,
    };
  }

  async getRecentTransactions(
    organizationId: string,
    limit = 10,
  ): Promise<FinancialTransaction[]> {
    // Busca Invoices e Expenses separadamente e junta na memória
    // Prisma não faz UNION nativo de forma simples sem raw query

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { organizationId },
        orderBy: { paidAt: "desc" }, // Ou paidAt, dependendo se quer ver caixa ou competência
        take: limit,
        include: {
          client: { select: { tradeName: true } },
          project: { select: { name: true } },
        },
      }),
      prisma.expense.findMany({
        where: { organizationId },
        orderBy: { date: "desc" },
        take: limit,
        include: {
          expenseCategory: { select: { name: true } },
          project: { select: { name: true } },
        },
      }),
    ]);

    // Mapeamento para interface unificada
    const incomeTrans: FinancialTransaction[] = invoices.map((inv) => ({
      id: inv.id,
      date: inv.paidAt || inv.dueDate || inv.createdAt, // Prioriza data de pagamento
      description: inv.description,
      type: "income",
      amount: Number(inv.amount),
      categoryOrClient: inv.client.tradeName,
      projectName: inv.project.name,
      status: this.mapInvoiceStatus(inv.status),
    }));

    const expenseTrans: FinancialTransaction[] = expenses.map((exp) => ({
      id: exp.id,
      date: exp.paidAt || exp.dueDate || exp.date,
      description: exp.description,
      type: "expense",
      amount: Number(exp.amount),
      categoryOrClient: exp.expenseCategory.name,
      projectName: exp.project.name,
      status: this.mapExpenseStatus(exp.status),
    }));

    // Junta e ordena
    return [...incomeTrans, ...expenseTrans]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async getPendingSettlements(
    organizationId: string,
  ): Promise<PendingPaymentDTO[]> {
    const today = date().toDate();

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: [FinancialStatus.PENDING, FinancialStatus.OVERDUE] },
      },
      orderBy: { dueDate: "asc" },
      include: {
        client: { select: { tradeName: true } },
        project: { select: { name: true } },
      },
    });

    return invoices.map((inv) => {
      const dueDate = date(inv.dueDate);
      const daysOverdue = date().diff(dueDate, "day");

      return {
        id: inv.id,
        clientName: inv.client.tradeName,
        projectName: inv.project.name,
        amount: Number(inv.amount),
        dueDate: inv.dueDate,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
        status: inv.status,
      };
    });
  }

  async getExpensesByCategory(
    organizationId: string,
  ): Promise<CategoryChartData[]> {
    // Agrupa despesas por categoria
    // Nota: Prisma group by relations não é direto, precisamos agrupar pelo ID e depois buscar os nomes
    // ou buscar tudo e agrupar no JS se o volume não for gigante.
    // Usando groupBy do prisma:

    const grouped = await prisma.expense.groupBy({
      by: ["expenseCategoryId"],
      where: { organizationId, status: ExpenseStatus.PAID },
      _sum: { amount: true },
    });

    // Busca os nomes das categorias
    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: { in: grouped.map((g) => g.expenseCategoryId) },
      },
    });

    // Cria mapa para acesso rápido
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    return grouped
      .map((g) => ({
        name: catMap.get(g.expenseCategoryId) || "Outros",
        value: Number(g._sum.amount || 0),
      }))
      .sort((a, b) => b.value - a.value); // Ordena do maior para o menor
  }

  async getFinancialProjections(organizationId: string) {
    const today = date().toDate();
    const threeMonthsFromNow = date().add(3, "month").toDate();

    const [invoices, expenses] = await Promise.all([
      // Receita Futura (Pendente com vencimento futuro)
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { in: [FinancialStatus.PENDING] },
          dueDate: { gte: today, lte: threeMonthsFromNow },
        },
        _sum: { amount: true },
      }),
      // Despesa Futura (Agendada/Pendente com vencimento futuro)
      prisma.expense.aggregate({
        where: {
          organizationId,
          status: { in: [ExpenseStatus.PENDING, ExpenseStatus.SCHEDULED] },
          dueDate: { gte: today, lte: threeMonthsFromNow },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      projectedRevenue: Number(invoices._sum.amount || 0),
      projectedExpenses: Number(expenses._sum.amount || 0),
    };
  }

  // ==========================
  // HELPERS
  // ==========================

  private mapInvoiceStatus(
    status: FinancialStatus,
  ): "confirmed" | "pending" | "cancelled" {
    if (status === FinancialStatus.PAID) return "confirmed";
    if (status === FinancialStatus.CANCELLED) return "cancelled";
    return "pending";
  }

  private mapExpenseStatus(
    status: ExpenseStatus,
  ): "confirmed" | "pending" | "cancelled" {
    if (status === ExpenseStatus.PAID) return "confirmed";
    if (status === ExpenseStatus.CANCELED) return "cancelled";
    return "pending";
  }

  private buildMonthlyChartData(invoices: any[], expenses: any[]) {
    const map = new Map<string, { revenue: number; expenses: number }>();

    // Inicializa últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const d = date().subtract(i, "month");
      const key = d.format("MMM");
      map.set(key, { revenue: 0, expenses: 0 });
    }

    invoices.forEach((inv) => {
      if (!inv.paidAt) return;
      const key = date(inv.paidAt).format("MMM");
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.revenue += Number(inv.amount);
      }
    });

    expenses.forEach((exp) => {
      if (!exp.paidAt) return;
      const key = date(exp.paidAt).format("MMM");
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.expenses += Number(exp.amount);
      }
    });

    return Array.from(map.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue, // CORREÇÃO: De 'receita' para 'revenue'
      expenses: data.expenses, // CORREÇÃO: De 'despesas' para 'expenses'
    }));
  }

  // ===========================================================================
  // MÉTODOS DO DASHBOARD DE PROJETO (JÁ EXISTENTES + REVISÃO DAYJS)
  // ===========================================================================
  async getBacklogMetrics(projectId: string) {
    const distribution = await prisma.backlogItem.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { status: true },
    });

    const totalTasks = distribution.reduce(
      (acc, curr) => acc + curr._count.status,
      0,
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
          previousRevValue,
        ),
        expenses: this.calculatePercentageChange(
          currentExpValue,
          previousExpValue,
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
            date(t.updatedAt).isBefore(currentDay.endOf("day")), // Garante inclusão de tudo feito no dia
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
      { count: 0, openValue: 0, wonValue: 0 },
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
      { activeCount: 0, totalValue: 0 },
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
