import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { ListExpensesUseCase } from "../ListExpensesUseCase";
import { makeExpenseRepository } from "@/repositories/factories/makeExpenseRepository";

let listExpenseUseCase: ListExpensesUseCase;

export function makeListExpenseUseCase() {
  if (!listExpenseUseCase) {
    const expenseRepository = makeExpenseRepository();
    const projectsRepository = makeProjectRepository();
    listExpenseUseCase = new ListExpensesUseCase(
      expenseRepository,
      projectsRepository
    );
  }

  return listExpenseUseCase;
}
