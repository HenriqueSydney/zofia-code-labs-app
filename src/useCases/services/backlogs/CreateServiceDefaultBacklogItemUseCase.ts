import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  ICreateServiceDefaultBacklogItemDTO,
  IServiceDefaultBacklogItemsRepository,
  ServiceDefaultBacklogItemWithDetails,
} from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

type CreateServiceDefaultBacklogItemParams = {
  data: Omit<ICreateServiceDefaultBacklogItemDTO, "organizationId">;
  userId: string;
  organizationId: string;
};

export class CreateServiceDefaultBacklogItemUseCase {
  constructor(
    private serviceDefaultBacklogItemsRepository: IServiceDefaultBacklogItemsRepository,
    private serviceTypeRepository: IServiceTypeRepository,
  ) {}

  async execute({
    data,
    userId,
    organizationId,
  }: CreateServiceDefaultBacklogItemParams): Promise<ServiceDefaultBacklogItemWithDetails> {
    const doesProjectExists = await this.serviceTypeRepository.findById(
      data.serviceTypeId,
      organizationId,
    );

    if (!doesProjectExists) {
      throw new ResourceNotFoundError("Serviço não localizado");
    }

    await checkUserPermissionForAsset(
      "servicesBacklog",
      userId,
      doesProjectExists,
      "CREATE",
    );

    const backlogItem = await this.serviceDefaultBacklogItemsRepository.create({
      ...data,
      organizationId: doesProjectExists.organizationId,
    });

    return backlogItem;
  }
}
