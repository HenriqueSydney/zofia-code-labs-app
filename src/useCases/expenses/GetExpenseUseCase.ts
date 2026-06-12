import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseRepository } from "@/repositories/IExpenseRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { ResourceNotFoundError } from "@/errors";
import { Expense } from "@/generated/prisma/client";

interface GetExpenseUseCaseRequest {
  userId: string;
  expenseId: string;
}

export class GetExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({
    userId,
    expenseId,
  }: GetExpenseUseCaseRequest): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);

    if (!expense) {
      throw new ResourceNotFoundError("Despesa não encontrada.");
    }

    const project = await this.projectsRepository.findById(expense.projectId);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("expense", userId, project, "READ");

    return expense;
  }
}
