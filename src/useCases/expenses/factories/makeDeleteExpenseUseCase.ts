import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { DeleteExpenseUseCase } from "../DeleteExpenseUseCase";
import { makeExpenseRepository } from "@/repositories/factories/makeExpenseRepository";

let deleteExpenseUseCase: DeleteExpenseUseCase;

export function makeDeleteExpenseUseCase() {
  if (!deleteExpenseUseCase) {
    const expenseRepository = makeExpenseRepository();
    const projectsRepository = makeProjectRepository();
    deleteExpenseUseCase = new DeleteExpenseUseCase(
      expenseRepository,
      projectsRepository
    );
  }

  return deleteExpenseUseCase;
}
