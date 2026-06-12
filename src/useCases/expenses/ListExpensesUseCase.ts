import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseRepository } from "@/repositories/IExpenseRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { ResourceNotFoundError } from "@/errors";
import { Expense } from "@/generated/prisma/client";

interface ListExpensesUseCaseRequest {
  userId: string;
  projectSlug: string;
  page?: number;
  perPage?: number;
  startDate?: Date;
  endDate?: Date;
}

interface ListExpensesUseCaseResponse {
  expenses: Expense[];
  total: number;
}

export class ListExpensesUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute(
    request: ListExpensesUseCaseRequest
  ): Promise<ListExpensesUseCaseResponse> {
    const { projectSlug, userId, page, perPage, startDate, endDate } = request;

    // 1. Busca o projeto
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    // 2. Verifica permissão de visualização (READ)
    await checkUserPermissionForAsset("expense", userId, project, "READ");

    // 3. Busca despesas no repositório
    const { data, total } = await this.expenseRepository.findMany({
      organizationId: project.organizationId,
      projectId: project.id,
      page,
      perPage,
      startDate,
      endDate,
    });

    return {
      expenses: data,
      total,
    };
  }
}
