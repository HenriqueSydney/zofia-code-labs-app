import { DeleteExpenseCategoryUseCase } from "../DeleteExpenseCategoryUseCase";
import { makeExpenseCategoryRepository } from "@/repositories/factories/makeExpenseCategoryRepository";

let deleteExpenseCategoryUseCase: DeleteExpenseCategoryUseCase;

export function makeDeleteExpenseCategoryUseCase() {
  if (!deleteExpenseCategoryUseCase) {
    const expenseCategoryRepository = makeExpenseCategoryRepository();
    deleteExpenseCategoryUseCase = new DeleteExpenseCategoryUseCase(
      expenseCategoryRepository
    );
  }

  return deleteExpenseCategoryUseCase;
}
