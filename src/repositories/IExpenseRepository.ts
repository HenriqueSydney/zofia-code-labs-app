import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { Expense, ExpenseStatus } from "@/generated/prisma/client";

export interface CreateExpenseDTO {
  organizationId: string;
  projectId: string;
  expenseCategoryId: string;
  description: string;
  amount: number; // Recebe number, converte para Decimal no repo
  date?: Date;
  dueDate?: Date;
  meta?: Record<string, any>;
}

export interface UpdateExpenseDTO {
  description?: string;
  amount?: number;
  status?: ExpenseStatus;
  expenseCategoryId?: string;
  supplier?: string | null;
  date?: Date;
  dueDate?: Date;
  meta?: Record<string, any>;
}

export interface FindManyExpensesParams {
  organizationId: string;
  projectId?: string;
  page?: number;
  perPage?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface IExpenseRepository {
  create(data: CreateExpenseDTO): Promise<PrismaToPlain<Expense>>;
  update(id: string, data: UpdateExpenseDTO): Promise<PrismaToPlain<Expense>>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<PrismaToPlain<Expense> | null>;
  findMany(params: FindManyExpensesParams): Promise<{
    data: PrismaToPlain<Expense>[];
    total: number;
  }>;
  getTotalByProject(projectId: string): Promise<number>;
}
