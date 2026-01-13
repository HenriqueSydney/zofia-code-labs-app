import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { UpdateExpenseUseCase } from "../UpdateExpenseUseCase";
import { makeExpenseRepository } from "@/repositories/factories/makeExpenseRepository";

let updateExpenseUseCase: UpdateExpenseUseCase;

export function makeUpdateExpenseUseCase() {
  if (!updateExpenseUseCase) {
    const expenseRepository = makeExpenseRepository();
    const projectsRepository = makeProjectRepository();
    updateExpenseUseCase = new UpdateExpenseUseCase(
      expenseRepository,
      projectsRepository
    );
  }

  return updateExpenseUseCase;
}
