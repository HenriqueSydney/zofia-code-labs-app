import { IExpenseRepository } from "../IExpenseRepository";
import { PrismaExpenseRepository } from "../prisma/PrismaExpenseRepository";

let expenseRepo: IExpenseRepository | null = null;

export function makeExpenseRepository() {
  if (!expenseRepo) {
    expenseRepo = new PrismaExpenseRepository();
  }
  return expenseRepo;
}
