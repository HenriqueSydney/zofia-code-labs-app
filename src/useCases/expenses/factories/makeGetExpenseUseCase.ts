import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetExpenseUseCase } from "../GetExpenseUseCase";
import { makeExpenseRepository } from "@/repositories/factories/makeExpenseRepository";

let getExpenseUseCase: GetExpenseUseCase;

export function makeGetExpenseUseCase() {
  if (!getExpenseUseCase) {
    const expenseRepository = makeExpenseRepository();
    const projectsRepository = makeProjectRepository();
    getExpenseUseCase = new GetExpenseUseCase(
      expenseRepository,
      projectsRepository
    );
  }

  return getExpenseUseCase;
}
