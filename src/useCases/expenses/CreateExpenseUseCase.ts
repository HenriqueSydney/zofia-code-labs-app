import { Prisma } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseRepository } from "@/repositories/IExpenseRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { ResourceNotFoundError } from "@/errors";
import { date } from "@/lib/dayjs";

interface CreateExpenseUseCaseRequest
  extends Omit<
    Prisma.ExpenseUncheckedCreateInput,
    "projectId" | "organizationId" | "id" | "createdAt"
  > {
  userId: string;
  projectSlug: string;
}

export class CreateExpenseUseCase {
  constructor(
    private expenseRepository: IExpenseRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute(request: CreateExpenseUseCaseRequest): Promise<void> {
    const { projectSlug, userId, ...expenseData } = request;

    // 1. Busca o projeto pelo slug
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    // 2. Verifica permissão no projeto
    await checkUserPermissionForAsset("expense", userId, project, "CREATE");

    // 3. Cria a despesa vinculando ao projeto e organização
    await this.expenseRepository.create({
      ...expenseData,
      projectId: project.id,
      organizationId: project.organizationId,
      amount: Number(expenseData.amount),
      date: expenseData.date ? date(expenseData.date).toDate() : undefined,
      dueDate: expenseData.dueDate
        ? date(expenseData.dueDate).toDate()
        : undefined,
      meta: (expenseData.meta as Record<string, any>) ?? undefined,
    });
  }
}
