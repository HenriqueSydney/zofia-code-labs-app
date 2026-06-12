import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseRepository } from "@/repositories/IExpenseRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { ResourceNotFoundError } from "@/errors";

interface DeleteExpenseUseCaseRequest {
  userId: string;
  expenseId: string;
}

export class DeleteExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({
    userId,
    expenseId,
  }: DeleteExpenseUseCaseRequest): Promise<void> {

    const expense = await this.expenseRepository.findById(expenseId);

    if (!expense) {
      throw new ResourceNotFoundError("Despesa não encontrada.");
    }

    const project = await this.projectsRepository.findById(expense.projectId);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    // Verifica permissão para DELETAR no contexto do projeto
    // As vezes a permissão de UPDATE cobre delete, ou existe uma DELETE explícita.
    // Vou usar DELETE seguindo o padrão REST, mas ajuste conforme seu checkUserPermissionForAsset
    await checkUserPermissionForAsset("expense", userId, project, "DELETE");

    await this.expenseRepository.delete(expenseId);
  }
}
