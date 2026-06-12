import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseRepository } from "@/repositories/IExpenseRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { ResourceNotFoundError } from "@/errors";
import { ExpenseStatus } from "@/generated/prisma/enums";
// Importe o Enum do Prisma se tiver criado, ex: ExpenseStatus
// import { ExpenseStatus } from "@/generated/prisma/client";

interface UpdateExpenseStatusUseCaseRequest {
  userId: string;
  expenseId: string;
  status: ExpenseStatus; // Substitua por ExpenseStatus se estiver usando Enum no Prisma
  paidAt?: Date | null;
}

export class UpdateExpenseStatusUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute(request: UpdateExpenseStatusUseCaseRequest): Promise<void> {
    const { userId, expenseId, status, paidAt } = request;

    const expense = await this.expenseRepository.findById(expenseId);

    if (!expense) {
      throw new ResourceNotFoundError("Despesa não encontrada.");
    }

    const project = await this.projectsRepository.findById(expense.projectId);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    // Geralmente mudar status financeiro exige permissão de UPDATE ou uma permissão específica "MANAGE_FINANCIAL"
    await checkUserPermissionForAsset("expense", userId, project, "UPDATE");

    await this.expenseRepository.update(expenseId, {
      status: status,
      // Se o status for "PAGO", e tiver data de pagamento, atualiza. Se não, limpa ou mantém.
      // A lógica exata depende de como seu Repository trata updates parciais.
      ...(paidAt !== undefined && { paidAt }),
    });
  }
}
