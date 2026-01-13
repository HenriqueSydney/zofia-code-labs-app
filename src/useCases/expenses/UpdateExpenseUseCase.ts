import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IExpenseRepository,
  UpdateExpenseDTO,
} from "@/repositories/IExpenseRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { AppError } from "@/errors/AppError";
import { date } from "@/lib/dayjs";

interface UpdateExpenseUseCaseRequest {
  userId: string;
  expenseId: string;
  data: UpdateExpenseDTO;
}

export class UpdateExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute(request: UpdateExpenseUseCaseRequest): Promise<void> {
    const { userId, expenseId, data } = request;

    // 1. Busca a despesa existente
    const expense = await this.expenseRepository.findById(expenseId);

    if (!expense) {
      throw new AppError("Despesa não encontrada.");
    }

    // 2. Busca o projeto para validar permissão (A permissão é sobre o PROJETO)
    const project = await this.projectsRepository.findById(expense.projectId);

    if (!project) {
      throw new AppError("Projeto vinculado à despesa não encontrado.");
    }

    await checkUserPermissionForAsset("expense", userId, project, "UPDATE");

    // 3. Verifica se o usuário pode editar itens neste projeto
    await this.expenseRepository.update(expenseId, {
      description: (data.description as string) || undefined,
      expenseCategoryId: (data.expenseCategoryId as string) || undefined,

      // Converte Decimal/String para Number se existir
      amount: data.amount ? Number(data.amount) : undefined,

      // Converte String para Date se existir
      date: data.date ? date(data.date).toDate() : undefined,
      dueDate: data.dueDate ? date(data.dueDate).toDate() : undefined,

      // Força o tipo do JSON
      meta: (data.meta as Record<string, any>) ?? undefined,

      // Se houver outros campos como status ou supplier:
      supplier: (data.supplier as string) || undefined,
      status: data.status || expense.status,
    });
  }
}
