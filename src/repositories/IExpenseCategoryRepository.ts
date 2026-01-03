import { Prisma, ExpenseCategory } from "@/generated/prisma/client";
import { PrismaToPlain } from "@/@types/PrismaToPlain";

export type CreateExpenseCategoryDTO =
  Prisma.ExpenseCategoryUncheckedCreateInput;

export interface IExpenseCategoryRepository {
  create(
    data: CreateExpenseCategoryDTO
  ): Promise<PrismaToPlain<ExpenseCategory>>;

  update(
    id: string,
    data: Partial<CreateExpenseCategoryDTO>
  ): Promise<PrismaToPlain<ExpenseCategory>>;

  list(
    organizationId: string,
    query?: string | null
  ): Promise<PrismaToPlain<ExpenseCategory>[]>;

  findByName(
    name: string,
    organizationId: string
  ): Promise<PrismaToPlain<ExpenseCategory> | null>;

  findById(
    id: string,
    organizationId: string
  ): Promise<PrismaToPlain<ExpenseCategory> | null>;

  delete(id: string): Promise<void>;
}
