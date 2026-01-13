import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { CreateExpenseUseCase } from "../CreateExpenseUseCase";
import { makeExpenseRepository } from "@/repositories/factories/makeExpenseRepository";

let createExpenseUseCase: CreateExpenseUseCase;

export function makeCreateExpenseUseCase() {
  if (!createExpenseUseCase) {
    const expenseRepository = makeExpenseRepository();
    const projectsRepository = makeProjectRepository();
    createExpenseUseCase = new CreateExpenseUseCase(
      expenseRepository,
      projectsRepository
    );
  }

  return createExpenseUseCase;
}
