import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { UpdateExpenseStatusUseCase } from "../UpdateExpenseStatusUseCase";
import { makeExpenseRepository } from "@/repositories/factories/makeExpenseRepository";

let updateExpenseStatusUseCase: UpdateExpenseStatusUseCase;

export function makeUpdateExpenseStatusUseCase() {
  if (!updateExpenseStatusUseCase) {
    const expenseRepository = makeExpenseRepository();
    const projectsRepository = makeProjectRepository();
    updateExpenseStatusUseCase = new UpdateExpenseStatusUseCase(
      expenseRepository,
      projectsRepository
    );
  }

  return updateExpenseStatusUseCase;
}
