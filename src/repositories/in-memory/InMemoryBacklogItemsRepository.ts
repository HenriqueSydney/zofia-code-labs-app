import { randomUUID } from "node:crypto";
import { Pagination } from "@/@types/Pagination";
import {
  BacklogItem,
  BacklogStatus,
  ServiceDefaultBacklogItem,
} from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { getPaginationQuery } from "@/utils/getPaginationQuery";
import {
  BacklogItemWithDetails,
  FindAllBacklogParams,
  IBacklogItemsRepository,
  ICreateBacklogItemDTO,
  IUpdateBacklogItemDTO,
} from "../IBacklogItemsRepository";

export class InMemoryBacklogItemsRepository implements IBacklogItemsRepository {
  public items: BacklogItem[] = [];
  public serviceDefaultSourceItems: ServiceDefaultBacklogItem[] = [];
  public users: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl?: string | null;
  }[] = [];
  public sprints: { id: string; name: string }[] = [];
  public projects: { id: string; name: string }[] = [];

  private toWithDetails(item: BacklogItem): BacklogItemWithDetails {
    const assignee = item.assigneeId
      ? (this.users.find((user) => user.id === item.assigneeId) ?? null)
      : null;
    const sprint = item.sprintId
      ? (this.sprints.find((s) => s.id === item.sprintId) ?? null)
      : null;
    const project = this.projects.find((p) => p.id === item.projectId);

    return {
      ...item,
      assignee,
      sprint,
      project,
    };
  }

  private applyFilters(items: BacklogItem[], params: FindAllBacklogParams) {
    return items.filter((item) => {
      if (item.projectId !== params.projectId) return false;

      if (params.query) {
        const query = params.query.toLowerCase();
        const matchesQuery =
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (params.status) {
        const statuses = Array.isArray(params.status)
          ? params.status
          : [params.status];
        if (!statuses.includes(item.status)) return false;
      }

      if (params.priority && item.priority !== params.priority) return false;

      if (params.assigneeId !== undefined && item.assigneeId !== params.assigneeId) {
        return false;
      }

      if (params.sprintId !== undefined && item.sprintId !== params.sprintId) {
        return false;
      }

      return true;
    });
  }

  async create(data: ICreateBacklogItemDTO): Promise<BacklogItemWithDetails> {
    const activeItems = this.items.filter(
      (item) =>
        item.projectId === data.projectId &&
        item.organizationId === data.organizationId,
    );
    const lastItem = activeItems.sort((a, b) => b.order - a.order)[0];
    const newOrder = lastItem ? lastItem.order + 1000 : 1000;
    const now = date().toDate();

    const newItem: BacklogItem = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      status: data.status ?? "TODO",
      order: newOrder,
      organizationId: data.organizationId,
      projectId: data.projectId,
      sprintId: data.sprintId ?? null,
      points: data.points ?? 0,
      priority: data.priority ?? "LOW",
      assigneeId: data.assigneeId ?? null,
      externalLink: data.externalLink ?? null,
      serviceDefaultBacklogItemId: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.items.push(newItem);
    return this.toWithDetails(newItem);
  }

  async update(data: IUpdateBacklogItemDTO): Promise<BacklogItemWithDetails> {
    const index = this.items.findIndex((item) => item.id === data.id);
    if (index === -1) {
      throw new Error("Backlog item not found");
    }

    const { id: _id, ...updateData } = data;
    const updated: BacklogItem = {
      ...this.items[index],
      ...updateData,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return this.toWithDetails(updated);
  }

  async findById(id: string): Promise<BacklogItemWithDetails | null> {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return null;
    return this.toWithDetails(item);
  }

  async findAll(
    params: FindAllBacklogParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: BacklogItemWithDetails[];
  }> {
    const filtered = this.applyFilters(this.items, params);
    const sorted = [...filtered].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const totalPoints = this.items
      .filter(
        (item) =>
          item.projectId === params.projectId && item.status !== "CANCELED",
      )
      .reduce((sum, item) => sum + item.points, 0);

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
    this.items = this.items.filter((item) => item.id !== id);
  }

  async updateStatus(id: string, status: BacklogStatus): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return;

    this.items[index] = {
      ...this.items[index],
      status,
      updatedAt: date().toDate(),
    };
  }

  async cancel(id: string): Promise<void> {
    await this.updateStatus(id, "CANCELED");
  }

  async reorderItem(
    itemId: string,
    newPositionIndex: number,
    allSortedIds: string[],
    status?: BacklogStatus,
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
      ...(status !== undefined ? { status } : {}),
      updatedAt: date().toDate(),
    };
  }

  async syncFromServiceType(
    projectId: string,
    serviceTypeId: string,
    organizationId: string,
  ): Promise<number> {
    const sourceItems = this.serviceDefaultSourceItems
      .filter(
        (item) =>
          item.serviceTypeId === serviceTypeId &&
          item.organizationId === organizationId &&
          item.deletedAt === null,
      )
      .sort((a, b) => a.order - b.order);

    if (sourceItems.length === 0) return 0;

    const alreadyImportedIds = new Set(
      this.items
        .filter((item) => item.projectId === projectId)
        .map((item) => item.serviceDefaultBacklogItemId)
        .filter((id): id is string => id !== null),
    );

    const itemsToCreate = sourceItems.filter(
      (source) => !alreadyImportedIds.has(source.id),
    );

    if (itemsToCreate.length === 0) return 0;

    const projectItems = this.items.filter((item) => item.projectId === projectId);
    const lastItem = projectItems.sort((a, b) => b.order - a.order)[0];
    let currentOrder = lastItem ? lastItem.order : 0;
    const now = date().toDate();

    for (const source of itemsToCreate) {
      currentOrder += 1000;
      this.items.push({
        id: randomUUID(),
        title: source.title,
        description: source.description,
        status: "TODO",
        order: currentOrder,
        organizationId,
        projectId,
        sprintId: null,
        points: source.points,
        priority: source.priority,
        assigneeId: null,
        externalLink: null,
        serviceDefaultBacklogItemId: source.id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }

    return itemsToCreate.length;
  }
}
