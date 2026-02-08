import { prisma } from "@/lib/prisma";
import {
  ClientBlockerItem,
  ClientDashboardStats,
  ClientProjectSummary,
  ClientWithStats,
  DeliveryEvolutionMetric,
  IClientsRepository,
  ICreateClientDTO,
  IUpdateClientDTO,
  ProjectPipelineMetric,
} from "../IClientsRepository";
import { Client, Prisma, ProjectStatus } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { DocumentInput } from "@/@types/DocumentInput";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { allStages, commercialStages } from "@/mappers/projectStageMapper";

export class PrismaClientsRepository implements IClientsRepository {
  async create(
    data: ICreateClientDTO,
    document?: DocumentInput,
  ): Promise<Client> {
    const client = await prisma.client.create({
      data: {
        ...data,
        logoReference: document?.url,
      },
    });
    return client;
  }

  async update(
    data: IUpdateClientDTO,
    document?: DocumentInput,
  ): Promise<Client> {
    const { id, ...updateData } = data;
    const client = await prisma.client.update({
      where: { id },
      data: { ...updateData, logoReference: document?.url },
    });
    return client;
  }

  async delete(id: string): Promise<void> {
    await prisma.client.update({
      data: {
        deletedAt: date().toDate(),
      },
      where: { id },
    });
  }

  async findById(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { id },
    });
    return client;
  }

  async findBySlug(slug: string): Promise<ClientWithStats | null> {
    const client = await prisma.client.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            projects: {
              where: { status: "IN_PROGRESS" }, // Apenas Projetos Ativos
            },
            invoices: {
              where: { status: "PENDING" }, // Ex: Faturas em Aberto
            },
          },
        },
        projects: {
          select: {
            totalBudget: true,
            startDate: true,
          },
        },
        // Caso precise de faturas específicas
        invoices: {
          where: { status: "PENDING" },
          select: { id: true },
        },
      },
    });

    if (!client) return null;

    // Cálculo de Total em Contratos
    const totalInContracts = client.projects.reduce(
      (acc, proj) => acc + Number(proj.totalBudget),
      0,
    );

    // Cálculo de Tempo de Casa (em anos)
    const startDate = client.createdAt;
    const tenure = date(startDate).fromNow();

    return normalizePrisma({
      ...client,
      stats: {
        activeProjects: client._count.projects,
        totalInContracts: totalInContracts,
        openInvoices: client._count.invoices,
        tenure: tenure,
      },
    });
  }

  async findByCnpj(cnpj: string): Promise<Client | null> {
    const client = await prisma.client.findFirst({
      where: { cnpj },
    });
    return client;
  }

  async fetchClients(
    organizationId: string,
    query?: string | null,
  ): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {
      organizationId,
    };

    if (query) {
      where.OR = [
        { companyName: { contains: query, mode: "insensitive" } },
        { tradeName: { contains: query, mode: "insensitive" } },
        { cnpj: { contains: query } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return clients;
  }

  async getClientStats(slug: string): Promise<ClientDashboardStats | null> {
    const client = await prisma.client.findUnique({
      where: { slug },
      include: {
        projects: {
          select: {
            status: true,
            totalBudget: true,
            endDate: true,
            tags: true, // Para identificar manutenção
            sprints: {
              where: { endDate: { gte: date().toDate() } },
              orderBy: { endDate: "asc" },
              take: 1,
            },
          },
        },
        invoices: {
          where: { status: { in: ["PENDING", "OVERDUE"] } },
          select: { status: true },
        },
        // Supondo que "Ações Pendentes" sejam BacklogItems com status específico
        // Se não tiver acesso direto, precisaria ir via projects -> backlog
      },
    });

    if (!client) return null;

    // Lógica de Negócio (Aggregation in-memory se o count do Prisma for complexo demais)

    const activeProjects = client.projects.filter(
      (p) => p.status === "IN_PROGRESS",
    ).length;

    // Identifica projetos de suporte pela tag ou categoria (ajuste conforme sua lógica real)
    const maintenanceProjects = client.projects.filter(
      (p) => p.tags.includes("SUPORTE") || p.tags.includes("MANUTENCAO"),
    ).length;

    const overdueInvoices = client.invoices.filter(
      (i) => i.status === "OVERDUE",
    ).length;
    const openInvoicesCount = client.invoices.length;

    // Busca itens pendentes do cliente (Ex: Status WAITING_CLIENT em todos os projetos)
    // Isso requer uma query separada se não incluímos acima para performance
    const pendingActionsCount = await prisma.backlogItem.count({
      where: {
        project: { clientId: client.id },
        status: "WAITING_CLIENT", // Ajuste para seu Enum de Status
      },
    });

    // Próxima entrega: Data de fim do projeto mais próxima ou da sprint atual
    const nextDeliveryDates = client.projects
      .map((p) => p.sprints[0]?.endDate || p.endDate)
      .filter((d) => d !== null)
      .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime());

    // Cálculo de Tempo de Casa (em anos)
    const startDate = client.createdAt;
    const tenure = date(startDate).fromNow();

    const totalInContracts = client.projects.reduce(
      (acc, curr) => acc + Number(curr.totalBudget),
      0,
    );

    return {
      activeProjects,
      maintenanceProjects,
      pendingActions: pendingActionsCount,
      overdueInvoices,
      openInvoicesCount,
      nextDeliveryDate: nextDeliveryDates[0] || null,
      totalInContracts,
      tenure,
    };
  }

  async getDeliveryEvolution(
    slug: string,
    months = 6,
  ): Promise<DeliveryEvolutionMetric[]> {
    const client = await prisma.client.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!client) return [];

    const startDate = date()
      .subtract(months, "month")
      .startOf("month")
      .toDate();

    // Busca Sprints finalizadas ou BacklogItems concluídos
    const sprints = await prisma.sprint.findMany({
      where: {
        project: { clientId: client.id },
        endDate: { gte: startDate },
      },
      select: {
        endDate: true,
        totalPoints: true, // Pontos planejados
        completedPoints: true, // Pontos entregues
      },
      orderBy: { endDate: "asc" },
    });

    // Agrupamento por Mês (JS processing)
    const grouped = new Map<string, { planned: number; completed: number }>();

    sprints.forEach((sprint) => {
      const monthKey = date(sprint.endDate).format("MMM"); // "Jan", "Fev"
      const current = grouped.get(monthKey) || { planned: 0, completed: 0 };

      // Se não usar pontos, pode usar count de tasks
      grouped.set(monthKey, {
        planned: current.planned + (sprint.totalPoints || 0),
        completed: current.completed + (sprint.completedPoints || 0),
      });
    });

    return Array.from(grouped.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  async getProjectPipeline(slug: string): Promise<ProjectPipelineMetric[]> {
    const result = await prisma.project.groupBy({
      by: ["status"],
      where: { client: { slug } },
      _count: { status: true },
    });

    return result.map((item) => {
      const status = allStages.find(
        (stage) => stage.key === item.status,
      )?.label;

      return {
        status: status || item.status,
        count: item._count.status,
      };
    });
  }

  async getClientBlockers(slug: string): Promise<ClientBlockerItem[]> {
    const blockers = await prisma.backlogItem.findMany({
      where: {
        project: { client: { slug } },
        // Assumindo que você tem um status ou flag para "Esperando Cliente"
        OR: [{ status: "WAITING_CLIENT" }],
      },
      select: {
        id: true,
        title: true,
        priority: true,
        project: { select: { name: true } },
      },
      orderBy: { priority: "desc" }, // Críticos primeiro
      take: 10,
    });

    return blockers.map((b) => ({
      id: b.id,
      title: b.title,
      priority: b.priority as any,
      projectName: b.project.name,
    }));
  }
}
