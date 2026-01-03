import { prisma } from "@/lib/prisma";
import { Prisma, ExpenseCategory } from "@/generated/prisma/client";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import {
  IExpenseCategoryRepository,
  CreateExpenseCategoryDTO,
} from "../IExpenseCategoryRepository";
import { date } from "@/lib/dayjs";

export class PrismaExpenseCategoryRepository
  implements IExpenseCategoryRepository
{
  async create(
    data: CreateExpenseCategoryDTO
  ): Promise<PrismaToPlain<ExpenseCategory>> {
    const category = await prisma.expenseCategory.create({
      data,
    });

    return normalizePrisma(category) as PrismaToPlain<ExpenseCategory>;
  }

  async update(
    id: string,
    data: Partial<CreateExpenseCategoryDTO>
  ): Promise<PrismaToPlain<ExpenseCategory>> {
    const category = await prisma.expenseCategory.update({
      where: { id },
      data,
    });

    return normalizePrisma(category) as PrismaToPlain<ExpenseCategory>;
  }

  async delete(id: string): Promise<void> {
    // Implementação de Soft Delete conforme definido no seu schema
    await prisma.expenseCategory.update({
      where: { id },
      data: {
        deletedAt: date().toDate(),
      },
    });
  }

  async list(
    organizationId: string,
    query?: string | null
  ): Promise<PrismaToPlain<ExpenseCategory>[]> {
    const where: Prisma.ExpenseCategoryWhereInput = {
      organizationId,
      deletedAt: null, // Filtra apenas as não removidas
    };

    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    const categories = await prisma.expenseCategory.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return categories.map(normalizePrisma) as PrismaToPlain<ExpenseCategory>[];
  }

  async findById(
    id: string,
    organizationId: string
  ): Promise<PrismaToPlain<ExpenseCategory> | null> {
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!category) return null;

    return normalizePrisma(category) as PrismaToPlain<ExpenseCategory>;
  }

  async findByName(
    name: string,
    organizationId: string
  ): Promise<PrismaToPlain<ExpenseCategory> | null> {
    const category = await prisma.expenseCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        organizationId,
        deletedAt: null,
      },
    });

    if (!category) return null;

    return normalizePrisma(category) as PrismaToPlain<ExpenseCategory>;
  }
}
