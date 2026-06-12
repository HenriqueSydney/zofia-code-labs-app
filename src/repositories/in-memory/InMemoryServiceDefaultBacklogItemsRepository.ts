import { randomUUID } from "node:crypto";
import { Pagination } from "@/@types/Pagination";
import { ServiceDefaultBacklogItem } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { getPaginationQuery } from "@/utils/getPaginationQuery";
import {
  FindAllServiceDefaultBacklogParams,
  ICreateServiceDefaultBacklogItemDTO,
  IServiceDefaultBacklogItemsRepository,
  IUpdateServiceDefaultBacklogItemDTO,
  ServiceDefaultBacklogItemWithDetails,
} from "../IServiceDefaultBacklogItemsRepository";

export class InMemoryServiceDefaultBacklogItemsRepository
  implements IServiceDefaultBacklogItemsRepository
{
  public items: ServiceDefaultBacklogItem[] = [];
  public serviceTypes: { id: string; name: string }[] = [];

  private toWithDetails(
    item: ServiceDefaultBacklogItem,
  ): ServiceDefaultBacklogItemWithDetails {
    const serviceType = this.serviceTypes.find(
      (type) => type.id === item.serviceTypeId,
    ) ?? { id: item.serviceTypeId, name: "" };

    return {
      ...item,
      serviceType,
    };
  }

  private applyFilters(
    items: ServiceDefaultBacklogItem[],
    params: FindAllServiceDefaultBacklogParams,
  ) {
    return items.filter((item) => {
      if (item.deletedAt !== null) return false;
      if (item.serviceTypeId !== params.serviceTypeId) return false;
      if (item.organizationId !== params.organizationId) return false;

      if (params.query) {
        const query = params.query.toLowerCase();
        const matchesQuery =
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (params.priority && item.priority !== params.priority) return false;

      return true;
    });
  }

  async create(
    data: ICreateServiceDefaultBacklogItemDTO,
  ): Promise<ServiceDefaultBacklogItemWithDetails> {
    const activeItems = this.items.filter(
      (item) =>
        item.serviceTypeId === data.serviceTypeId &&
        item.organizationId === data.organizationId &&
        item.deletedAt === null,
    );
    const lastItem = activeItems.sort((a, b) => b.order - a.order)[0];
    const newOrder = lastItem ? lastItem.order + 1000 : 1000;
    const now = date().toDate();

    const newItem: ServiceDefaultBacklogItem = {
      id: randomUUID(),
      organizationId: data.organizationId,
      serviceTypeId: data.serviceTypeId,
      title: data.title,
      description: data.description,
      order: newOrder,
      points: data.points ?? 0,
      priority: data.priority ?? "LOW",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.items.push(newItem);
    return this.toWithDetails(newItem);
  }

  async update(
    data: IUpdateServiceDefaultBacklogItemDTO,
  ): Promise<ServiceDefaultBacklogItemWithDetails> {
    const index = this.items.findIndex((item) => item.id === data.id);
    if (index === -1) {
      throw new Error("Service default backlog item not found");
    }

    const { id: _id, ...updateData } = data;
    const updated: ServiceDefaultBacklogItem = {
      ...this.items[index],
      ...updateData,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return this.toWithDetails(updated);
  }

  async findById(
    id: string,
  ): Promise<ServiceDefaultBacklogItemWithDetails | null> {
    const item = this.items.find((entry) => entry.id === id);
    if (!item || item.deletedAt) return null;
    return this.toWithDetails(item);
  }

  async findAll(
    params: FindAllServiceDefaultBacklogParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: ServiceDefaultBacklogItemWithDetails[];
  }> {
    const filtered = this.applyFilters(this.items, params);
    const sorted = [...filtered].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const totalPoints = filtered.reduce((sum, item) => sum + item.points, 0);

    const paginationDef = getPaginationQuery(pagination);
    const skip = "skip" in paginationDef ? (paginationDef.skip as number) : 0;
    const take =
      "take" in paginationDef
        ? (paginationDef.take as number)
        : sorted.length;
    const paginated = sorted.slice(skip, skip + take);

    return {
      totalOfRegisters: filtered.length,
      totalPoints,
      items: paginated.map((item) => this.toWithDetails(item)),
    };
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return;

    this.items[index] = {
      ...this.items[index],
      deletedAt: date().toDate(),
      updatedAt: date().toDate(),
    };
  }

  async reorderItem(
    itemId: string,
    newPositionIndex: number,
    allSortedIds: string[],
  ): Promise<void> {
    const prevId = allSortedIds[newPositionIndex - 1];
    const nextId = allSortedIds[newPositionIndex + 1];

    const prevItem = prevId
      ? this.items.find((item) => item.id === prevId)
      : null;
    const nextItem = nextId
      ? this.items.find((item) => item.id === nextId)
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

    const index = this.items.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    this.items[index] = {
      ...this.items[index],
      order: newOrderValue,
      updatedAt: date().toDate(),
    };
  }
}
