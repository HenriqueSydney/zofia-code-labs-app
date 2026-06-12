import { ResourceNotFoundError } from "@/errors";
import { BacklogStatus } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IBacklogItemsRepository } from "@/repositories/IBacklogItemsRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

interface UpdateBacklogStatusRequest {
  id: string;
  newStatus: BacklogStatus;
  userId: string;
}

export class UpdateBacklogItemStatusUseCase {
  constructor(
    private backlogItemsRepository: IBacklogItemsRepository,
    private projectsRepository: IProjectsRepository,
  ) {}

  async execute({
    id,
    newStatus,
    userId,
  }: UpdateBacklogStatusRequest): Promise<{
    projectId: string;
    slug: string;
    clientSlug: string;
  }> {
    const itemExists = await this.backlogItemsRepository.findById(id);

    if (!itemExists) {
      throw new ResourceNotFoundError("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, itemExists, "MANAGE");

    // Método otimizado criado no Repositório para update parcial
    await this.backlogItemsRepository.updateStatus(id, newStatus);

    const project = await this.projectsRepository.findById(
      itemExists.projectId,
    );

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    return {
      projectId: project.id,
      slug: project.slug,
      clientSlug: project.client.slug,
    };
  }
}
