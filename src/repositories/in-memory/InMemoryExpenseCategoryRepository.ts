import { randomUUID } from "node:crypto";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { ExpenseCategory } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import {
  CreateExpenseCategoryDTO,
  IExpenseCategoryRepository,
} from "../IExpenseCategoryRepository";

export class InMemoryExpenseCategoryRepository
  implements IExpenseCategoryRepository
{
  public items: ExpenseCategory[] = [];

  async create(
    data: CreateExpenseCategoryDTO,
  ): Promise<PrismaToPlain<ExpenseCategory>> {
    const now = date().toDate();

    const category: ExpenseCategory = {
      id: data.id ?? randomUUID(),
      organizationId: data.organizationId,
      name: data.name,
      description: data.description ?? null,
      nature: data.nature ?? "OPERATIONAL",
      createdAt: data.createdAt ? new Date(data.createdAt) : now,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : now,
      deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
    };

    this.items.push(category);
    return category;
  }

  async update(
    id: string,
    data: Partial<CreateExpenseCategoryDTO>,
  ): Promise<PrismaToPlain<ExpenseCategory>> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ExpenseCategory not found");
    }

    const current = this.items[index];

    const updated: ExpenseCategory = {
      ...current,
      ...(data.organizationId !== undefined && {
        organizationId: data.organizationId,
      }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.nature !== undefined && { nature: data.nature }),
      ...(data.deletedAt !== undefined && {
        deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
      }),
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    this.items[index] = {
      ...this.items[index],
      deletedAt: date().toDate(),
      updatedAt: date().toDate(),
    };
  }

  async list(
    organizationId: string,
    query?: string | null,
  ): Promise<PrismaToPlain<ExpenseCategory>[]> {
    let result = this.items.filter(
      (item) => item.organizationId === organizationId && item.deletedAt === null,
    );

    if (query) {
      const normalizedQuery = query.toLowerCase();

      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          (item.description?.toLowerCase().includes(normalizedQuery) ?? false),
      );
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<PrismaToPlain<ExpenseCategory> | null> {
    const category = this.items.find(
      (item) =>
        item.id === id &&
        item.organizationId === organizationId &&
        item.deletedAt === null,
    );

    return category ?? null;
  }

  async findByName(
    name: string,
    organizationId: string,
  ): Promise<PrismaToPlain<ExpenseCategory> | null> {
    const category = this.items.find(
      (item) =>
        item.organizationId === organizationId &&
        item.deletedAt === null &&
        item.name.toLowerCase() === name.toLowerCase(),
    );

    return category ?? null;
  }
}
