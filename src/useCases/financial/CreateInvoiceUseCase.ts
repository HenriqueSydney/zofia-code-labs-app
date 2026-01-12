// useCases/financial/CreateInvoiceUseCase.ts
import { Prisma } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IInvoiceRepository } from "@/repositories/IInvoiceRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { AppError } from "@/errors/AppError";

interface CreateInvoiceUseCaseRequest
  extends Omit<Prisma.InvoiceUncheckedCreateInput, "projectId"> {
  userId: string;
  projectSlug: string;
}

export class CreateInvoiceUseCase {
  constructor(
    private invoiceRepository: IInvoiceRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute(request: CreateInvoiceUseCaseRequest): Promise<void> {
    const { projectSlug, userId, ...invoiceData } = request;

    // 1. Busca o projeto pelo slug para obter o ID real
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new AppError("Projeto não encontrado.");
    }

    /**
     * 2. Verifica se o usuário tem permissão no projeto.
     * Usamos "UPDATE" ou um nível que permita gerenciar o financeiro do projeto.
     */
    await checkUserPermissionForAsset("project", userId, project, "UPDATE");

    // 3. Cria a invoice vinculando o projectId obtido e a organizationId do projeto
    await this.invoiceRepository.create({
      ...invoiceData,
      projectId: project.id,
      clientId: project.clientId,
      organizationId: project.organizationId, // Garante que a invoice pertença à mesma org do projeto
    });
  }
}
