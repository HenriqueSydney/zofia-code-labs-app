import { IExpenseCategoryRepository } from "../IExpenseCategoryRepository";
import { PrismaExpenseCategoryRepository } from "../prisma/PrismaExpenseCategoryRepository";

let expenseCategoryRepo: IExpenseCategoryRepository | null = null;

export function makeExpenseCategoryRepository() {
  if (!expenseCategoryRepo) {
    expenseCategoryRepo = new PrismaExpenseCategoryRepository();
  }
  return expenseCategoryRepo;
}
