import { randomUUID } from "node:crypto";

import { Expense, ExpenseStatus, Prisma } from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import { PrismaToPlain } from "../../@types/PrismaToPlain";
import {
  CreateExpenseDTO,
  FindManyExpensesParams,
  IExpenseRepository,
  UpdateExpenseDTO,
} from "../IExpenseRepository";

export class InMemoryExpenseRepository implements IExpenseRepository {
  public items: Expense[] = [];

  async create(data: CreateExpenseDTO): Promise<PrismaToPlain<Expense>> {
    const now = date().toDate();

    const expense: Expense = {
      id: randomUUID(),
      organizationId: data.organizationId,
      projectId: data.projectId,
      expenseCategoryId: data.expenseCategoryId,
      description: data.description,
      supplier: null,
      amount: new Prisma.Decimal(data.amount),
      status: ExpenseStatus.PENDING,
      date: data.date ?? now,
      dueDate: data.dueDate ?? null,
      paidAt: null,
      attachmentUrl: null,
      createdById: null,
      meta: data.meta ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(expense);

    return this.toPlain(expense);
  }

  async update(
    id: string,
    data: UpdateExpenseDTO,
  ): Promise<PrismaToPlain<Expense>> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("Expense not found");
    }

    const current = this.items[index];
    const updated: Expense = {
      ...current,
      description: data.description ?? current.description,
      amount:
        data.amount !== undefined
          ? new Prisma.Decimal(data.amount)
          : current.amount,
      status: data.status ?? current.status,
      expenseCategoryId: data.expenseCategoryId ?? current.expenseCategoryId,
      supplier: data.supplier !== undefined ? data.supplier : current.supplier,
      date: data.date ?? current.date,
      dueDate: data.dueDate !== undefined ? data.dueDate : current.dueDate,
      meta: data.meta !== undefined ? data.meta : current.meta,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;

    return this.toPlain(updated);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async findById(id: string): Promise<PrismaToPlain<Expense> | null> {
    const expense = this.items.find((item) => item.id === id);

    return expense ? this.toPlain(expense) : null;
  }

  async findMany({
    organizationId,
    projectId,
    page = 1,
    perPage = 20,
    startDate,
    endDate,
  }: FindManyExpensesParams): Promise<{
    data: PrismaToPlain<Expense>[];
    total: number;
  }> {
    let filtered = this.items.filter(
      (item) => item.organizationId === organizationId,
    );

    if (projectId) {
      filtered = filtered.filter((item) => item.projectId === projectId);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(
        (item) => item.date >= startDate && item.date <= endDate,
      );
    }

    filtered = filtered.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    const total = filtered.length;
    const start = (page - 1) * perPage;
    const data = filtered.slice(start, start + perPage).map((item) =>
      this.toPlain(item),
    );

    return { data, total };
  }

  async getTotalByProject(projectId: string): Promise<number> {
    return this.items
      .filter((item) => item.projectId === projectId)
      .reduce((sum, item) => sum + item.amount.toNumber(), 0);
  }

  private toPlain(expense: Expense): PrismaToPlain<Expense> {
    return {
      ...expense,
      amount: expense.amount.toNumber(),
    } as PrismaToPlain<Expense>;
  }
}
