import { prisma } from "@/lib/prisma";
import {
  FindAllBacklogParams,
  IBacklogItemsRepository,
  ICreateBacklogItemDTO,
  IUpdateBacklogItemDTO,
  BacklogItemWithDetails,
} from "../IBacklogItemsRepository";
import { Pagination } from "@/@types/Pagination";
import { BacklogStatus, Prisma } from "@/generated/prisma/client";
import { getPaginationQuery } from "@/utils/getPaginationQuery";
import { normalizePrisma } from "@/utils/normalizePrisma";

export class PrismaBacklogItemsRepository implements IBacklogItemsRepository {
  async create(data: ICreateBacklogItemDTO): Promise<BacklogItemWithDetails> {
    const lastItem = await prisma.backlogItem.findFirst({
      where: {
        projectId: data.projectId,
        organizationId: data.organizationId,
      },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastItem ? lastItem.order + 1000 : 1000;

    const item = await prisma.backlogItem.create({
      data: {
        title: data.title,
        description: data.description,
        points: data.points ?? 0,
        priority: data.priority ?? "LOW",
        status: data.status ?? "TODO",
        externalLink: data.externalLink,
        organizationId: data.organizationId,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        order: newOrder,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        sprint: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return normalizePrisma(item) as BacklogItemWithDetails;
  }

  async findById(id: string): Promise<BacklogItemWithDetails | null> {
    const item = await prisma.backlogItem.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        sprint: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!item) return null;

    return normalizePrisma(item) as BacklogItemWithDetails;
  }

  async findAll(
    params: FindAllBacklogParams,
    pagination?: Pagination
  ): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: BacklogItemWithDetails[];
  }> {
    // Construção dinâmica do filtro WHERE
    const where: Prisma.BacklogItemWhereInput = {
      projectId: params.projectId, // Filtro base obrigatório
    };

    // Filtro por Texto (Título ou Descrição)
    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
      ];
    }

    // Filtros Opcionais
    if (params.status) {
      // Suporta array de status ou status único
      where.status = Array.isArray(params.status)
        ? { in: params.status }
        : params.status;
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    if (params.assigneeId !== undefined) {
      // Se for null, busca unassigned. Se for string, busca específico.
      where.assigneeId = params.assigneeId;
    }

    if (params.sprintId !== undefined) {
      // Se for null, busca itens fora de sprint (backlog puro)
      where.sprintId = params.sprintId;
    }

    const paginationDef = pagination ? getPaginationQuery(pagination) : {};

    const [totalOfRegisters, totalPoints, items] = await Promise.all([
      prisma.backlogItem.count({ where }),
      prisma.backlogItem.aggregate({
        _sum: {
          points: true,
        },
        where: {
          status: {
            not: "CANCELED",
          },
          projectId: {
            equals: params.projectId,
          },
        },
      }),
      prisma.backlogItem.findMany({
        where,
        ...paginationDef,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          sprint: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }], // Ou orderBy: { priority: 'desc' } dependendo da regra
      }),
    ]);

    const plain = items.map(normalizePrisma);

    return {
      totalOfRegisters,
      totalPoints: totalPoints._sum.points ?? 0,
      items: plain as BacklogItemWithDetails[],
    };
  }

  async update(data: IUpdateBacklogItemDTO): Promise<BacklogItemWithDetails> {
    const { id, ...updateData } = data;

    const item = await prisma.backlogItem.update({
      where: { id },
      data: {
        ...updateData,
        assigneeId: updateData.assigneeId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        sprint: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return normalizePrisma(item) as BacklogItemWithDetails;
  }

  async updateStatus(id: string, status: any): Promise<void> {
    await prisma.backlogItem.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.backlogItem.delete({
      where: { id },
    });
  }

  async cancel(id: string): Promise<void> {
    await prisma.backlogItem.update({
      data: {
        status: "CANCELED",
      },
      where: { id },
    });
  }

  async reorderItem(
    itemId: string,
    newPositionIndex: number,
    allSortedIds: string[],
    status?: BacklogStatus
  ): Promise<void> {
    // Pegamos o ID do item que ficaria ANTES e DEPOIS na nova posição
    const prevId = allSortedIds[newPositionIndex - 1];
    const nextId = allSortedIds[newPositionIndex + 1];

    const prevItem = prevId
      ? await prisma.backlogItem.findUnique({ where: { id: prevId } })
      : null;
    const nextItem = nextId
      ? await prisma.backlogItem.findUnique({ where: { id: nextId } })
      : null;

    let newOrderValue: number;

    if (prevItem && nextItem) {
      newOrderValue = (prevItem.order + nextItem.order) / 2;
    } else if (prevItem) {
      newOrderValue = prevItem.order + 1000;
    } else if (nextItem) {
      newOrderValue = nextItem.order / 2;
    } else {
      newOrderValue = 1000;
    }

    await prisma.backlogItem.update({
      where: { id: itemId },
      data: { order: newOrderValue, status },
    });
  }
}
