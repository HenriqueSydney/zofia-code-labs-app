// useCases/financial/ListInvoicesByProjectUseCase.ts
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IInvoiceRepository,
  InvoiceWithDetails,
} from "@/repositories/IInvoiceRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

interface ListInvoicesRequest {
  projectSlug: string;
  userId: string;
}

export class ListInvoicesByProjectUseCase {
  constructor(
    private invoiceRepository: IInvoiceRepository,
    private projectRepository: IProjectsRepository
  ) {}

  async execute({
    projectSlug,
    userId,
  }: ListInvoicesRequest): Promise<InvoiceWithDetails[]> {
    const project = await this.projectRepository.findBySlug(projectSlug);

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("invoice", userId, project, "UPDATE");

    return await this.invoiceRepository.findByProjectId(project.id);
  }
}
