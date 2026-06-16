import { ResourceNotFoundError } from "@/errors";
import { BacklogStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IBacklogItemsRepository } from "@/repositories/IBacklogItemsRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

type ReorderBacklogItemParams = {
  id: string;
  newPositionIndex: number;
  allSortedIds: string[];
  userId: string;
  status?: BacklogStatus;
};

export class ReorderBacklogItemUseCase {
  constructor(
    private backlogItemsRepository: IBacklogItemsRepository,
    private projectsRepository: IProjectsRepository,
  ) {}

  async execute({
    id,
    newPositionIndex,
    allSortedIds,
    userId,
    status,
  }: ReorderBacklogItemParams): Promise<{
    slug: string;
    clientSlug: string;
  }> {
    const itemExists = await this.backlogItemsRepository.findById(id);

    if (!itemExists) {
      throw new ResourceNotFoundError("Item do backlog não encontrado.");
    }

    await checkUserPermissionForAsset("backlog", userId, itemExists, "MANAGE");

    await this.backlogItemsRepository.reorderItem(
      id,
      newPositionIndex,
      allSortedIds,
      status,
    );

    const project = await this.projectsRepository.findById(itemExists.projectId);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    return {
      slug: project.slug,
      clientSlug: project.client.slug,
    };
  }
}
