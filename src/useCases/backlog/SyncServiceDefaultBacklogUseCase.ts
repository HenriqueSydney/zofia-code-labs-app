import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IBacklogItemsRepository } from "@/repositories/IBacklogItemsRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

type SyncServiceDefaultBacklogParams = {
  projectId: string;
  serviceTypeId: string;
  userId: string;
  organizationId: string;
};

export class SyncServiceDefaultBacklogUseCase {
  constructor(
    private backlogItemsRepository: IBacklogItemsRepository,
    private projectsRepository: IProjectsRepository,
  ) {}

  async execute({
    projectId,
    serviceTypeId,
    userId,
    organizationId,
  }: SyncServiceDefaultBacklogParams): Promise<number> {
    // 1. Busca o projeto para contexto de segurança
    const project = await this.projectsRepository.findById(projectId);

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    // 2. Verifica se o usuário tem permissão para editar este projeto
    // Assumindo que adicionar itens ao backlog conta como "UPDATE" no projeto
    await checkUserPermissionForAsset("backlog", userId, project, "UPDATE");

    // 3. Executa a sincronização no repositório
    const itemsCreatedCount =
      await this.backlogItemsRepository.syncFromServiceType(
        projectId,
        serviceTypeId,
        organizationId,
      );

    return itemsCreatedCount;
  }
}
