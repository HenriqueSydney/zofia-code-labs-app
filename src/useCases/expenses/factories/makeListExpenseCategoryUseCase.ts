import { ListExpenseCategoryUseCase } from "../ListExpenseCategoryUseCase";
import { makeExpenseCategoryRepository } from "@/repositories/factories/makeExpenseCategoryRepository";

let listExpenseCategoryUseCase: ListExpenseCategoryUseCase;

export function makeListExpenseCategoryUseCase() {
  if (!listExpenseCategoryUseCase) {
    const expenseCategoryRepository = makeExpenseCategoryRepository();
    listExpenseCategoryUseCase = new ListExpenseCategoryUseCase(
      expenseCategoryRepository
    );
  }

  return listExpenseCategoryUseCase;
}
