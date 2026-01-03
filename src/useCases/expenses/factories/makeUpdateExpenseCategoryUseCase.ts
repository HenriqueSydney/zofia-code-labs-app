import { UpdateExpenseCategoryUseCase } from "../UpdateExpenseCategoryUseCase";
import { makeExpenseCategoryRepository } from "@/repositories/factories/makeExpenseCategoryRepository";

let updateExpenseCategoryUseCase: UpdateExpenseCategoryUseCase;

export function makeUpdateExpenseCategoryUseCase() {
  if (!updateExpenseCategoryUseCase) {
    const expenseCategoryRepository = makeExpenseCategoryRepository();
    updateExpenseCategoryUseCase = new UpdateExpenseCategoryUseCase(
      expenseCategoryRepository
    );
  }

  return updateExpenseCategoryUseCase;
}
