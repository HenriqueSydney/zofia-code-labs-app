import { prisma } from "@/lib/prisma";

import { PrismaToPlain } from "@/@types/PrismaToPlain";
import {
  CreateExpenseDTO,
  FindManyExpensesParams,
  IExpenseRepository,
  UpdateExpenseDTO,
} from "../IExpenseRepository";
import { Expense, Prisma } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { normalizePrisma } from "@/utils/normalizePrisma";

export class PrismaExpenseRepository implements IExpenseRepository {
  async create(data: CreateExpenseDTO): Promise<PrismaToPlain<Expense>> {
    return normalizePrisma(
      await prisma.expense.create({
        data: {
          organizationId: data.organizationId,
          projectId: data.projectId,
          expenseCategoryId: data.expenseCategoryId,
          description: data.description,
          amount: new Prisma.Decimal(data.amount), // Garante conversão correta
          date: data.date || date().toDate(),
          meta: data.meta ?? Prisma.JsonNull,
        },
      })
    );
  }

  async findById(id: string): Promise<PrismaToPlain<Expense> | null> {
    return normalizePrisma(
      await prisma.expense.findUnique({
        where: { id },
        include: {
          expenseCategory: true, // Geralmente útil trazer a categoria junto
          project: {
            select: { name: true }, // Opcional: trazer nome do projeto
          },
        },
      })
    );
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
    // Constrói a cláusula Where dinamicamente
    const where: Prisma.ExpenseWhereInput = {
      organizationId,
      ...(projectId && { projectId }),
      ...(startDate &&
        endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [count, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        take: perPage,
        skip: (page - 1) * perPage,
        orderBy: { date: "desc" }, // Mais recentes primeiro
        include: {
          expenseCategory: true,
        },
      }),
    ]);

    return {
      data: expenses.map(normalizePrisma),
      total: count,
    };
  }

  async update(
    id: string,
    data: UpdateExpenseDTO
  ): Promise<PrismaToPlain<Expense>> {
    return normalizePrisma(
      await prisma.expense.update({
        where: { id },
        data: {
          ...data,
          amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
        },
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }

  // Método extra útil para Dashboards Financeiros
  async getTotalByProject(projectId: string): Promise<number> {
    const aggregate = await prisma.expense.aggregate({
      where: { projectId },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount?.toNumber() || 0;
  }
}
