import { CreateExpenseCategoryUseCase } from "../CreateExpenseCategoryUseCase";
import { makeExpenseCategoryRepository } from "@/repositories/factories/makeExpenseCategoryRepository";

let createExpenseCategoryUseCase: CreateExpenseCategoryUseCase;

export function makeCreateExpenseCategoryUseCase() {
  if (!createExpenseCategoryUseCase) {
    const expenseCategoryRepository = makeExpenseCategoryRepository();
    createExpenseCategoryUseCase = new CreateExpenseCategoryUseCase(
      expenseCategoryRepository
    );
  }

  return createExpenseCategoryUseCase;
}
