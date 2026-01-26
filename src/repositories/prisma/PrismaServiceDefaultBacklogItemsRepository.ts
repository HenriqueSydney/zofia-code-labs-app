import { prisma } from "@/lib/prisma";
import {
  FindAllServiceDefaultBacklogParams,
  IServiceDefaultBacklogItemsRepository,
  ICreateServiceDefaultBacklogItemDTO,
  IUpdateServiceDefaultBacklogItemDTO,
  ServiceDefaultBacklogItemWithDetails,
} from "../IServiceDefaultBacklogItemsRepository";
import { Pagination } from "@/@types/Pagination";
import { Prisma } from "@/generated/prisma/client";
import { getPaginationQuery } from "@/utils/getPaginationQuery";
import { normalizePrisma } from "@/utils/normalizePrisma";

export class PrismaServiceDefaultBacklogItemsRepository implements IServiceDefaultBacklogItemsRepository {
  async create(
    data: ICreateServiceDefaultBacklogItemDTO,
  ): Promise<ServiceDefaultBacklogItemWithDetails> {
    // Busca o último item para definir a ordem (dentro do mesmo ServiceType)
    const lastItem = await prisma.serviceDefaultBacklogItem.findFirst({
      where: {
        serviceTypeId: data.serviceTypeId,
        organizationId: data.organizationId,
        deletedAt: null, // Ignora itens deletados no cálculo de ordem
      },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastItem ? lastItem.order + 1000 : 1000;

    const item = await prisma.serviceDefaultBacklogItem.create({
      data: {
        title: data.title,
        description: data.description,
        points: data.points ?? 0,
        priority: data.priority ?? "LOW",
        organizationId: data.organizationId,
        serviceTypeId: data.serviceTypeId,
        order: newOrder,
      },
      include: {
        serviceType: { select: { id: true, name: true } },
      },
    });

    return normalizePrisma(item) as ServiceDefaultBacklogItemWithDetails;
  }

  async findById(
    id: string,
  ): Promise<ServiceDefaultBacklogItemWithDetails | null> {
    const item = await prisma.serviceDefaultBacklogItem.findUnique({
      where: { id },
      include: {
        serviceType: { select: { id: true, name: true } },
      },
    });

    if (!item || item.deletedAt) return null;

    return normalizePrisma(item) as ServiceDefaultBacklogItemWithDetails;
  }

  async findAll(
    params: FindAllServiceDefaultBacklogParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: ServiceDefaultBacklogItemWithDetails[];
  }> {
    // Construção dinâmica do filtro WHERE
    const where: Prisma.ServiceDefaultBacklogItemWhereInput = {
      serviceTypeId: params.serviceTypeId,
      organizationId: params.organizationId,
      deletedAt: null, // Apenas itens ativos
    };

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
      ];
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    const paginationDef = pagination ? getPaginationQuery(pagination) : {};
    const [totalOfRegisters, totalPoints, items] = await Promise.all([
      prisma.serviceDefaultBacklogItem.count({ where }),
      prisma.serviceDefaultBacklogItem.aggregate({
        _sum: {
          points: true,
        },
        where,
      }),
      prisma.serviceDefaultBacklogItem.findMany({
        where,
        ...paginationDef,
        include: {
          serviceType: { select: { id: true, name: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const plain = items.map(normalizePrisma);

    return {
      totalOfRegisters,
      totalPoints: totalPoints._sum.points ?? 0,
      items: plain as ServiceDefaultBacklogItemWithDetails[],
    };
  }

  async update(
    data: IUpdateServiceDefaultBacklogItemDTO,
  ): Promise<ServiceDefaultBacklogItemWithDetails> {
    const { id, ...updateData } = data;

    const item = await prisma.serviceDefaultBacklogItem.update({
      where: { id },
      data: {
        ...updateData,
      },
      include: {
        serviceType: { select: { id: true, name: true } },
      },
    });

    return normalizePrisma(item) as ServiceDefaultBacklogItemWithDetails;
  }

  async delete(id: string): Promise<void> {
    // Implementação de Soft Delete conforme sugerido pelo campo deletedAt
    await prisma.serviceDefaultBacklogItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async reorderItem(
    itemId: string,
    newPositionIndex: number,
    allSortedIds: string[],
  ): Promise<void> {
    const prevId = allSortedIds[newPositionIndex - 1];
    const nextId = allSortedIds[newPositionIndex + 1];

    const prevItem = prevId
      ? await prisma.serviceDefaultBacklogItem.findUnique({
          where: { id: prevId },
        })
      : null;
    const nextItem = nextId
      ? await prisma.serviceDefaultBacklogItem.findUnique({
          where: { id: nextId },
        })
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

    await prisma.serviceDefaultBacklogItem.update({
      where: { id: itemId },
      data: { order: newOrderValue },
    });
  }
}
