import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IBacklogItemsRepository,
  ICreateBacklogItemDTO,
  BacklogItemWithDetails,
} from "@/repositories/IBacklogItemsRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";

type CreateBacklogItemParams = {
  data: Omit<ICreateBacklogItemDTO, "organizationId">;
  userId: string;
};

export class CreateBacklogItemUseCase {
  constructor(
    private backlogItemsRepository: IBacklogItemsRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({
    data,
    userId,
  }: CreateBacklogItemParams): Promise<BacklogItemWithDetails> {
    const doesProjectExists = await this.projectsRepository.findById(
      data.projectId
    );

    if (!doesProjectExists) {
      throw new ResourceNotFoundError("Projeto não localizado");
    }

    await checkUserPermissionForAsset(
      "backlog",
      userId,
      doesProjectExists,
      "MANAGE"
    );

    const backlogItem = await this.backlogItemsRepository.create({
      ...data,
      organizationId: doesProjectExists.organizationId,
    });

    return backlogItem;
  }
}
