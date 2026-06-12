import { ResourceNotFoundError } from "@/errors";
import { BacklogPriority } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IServiceDefaultBacklogItemsRepository,
  ServiceDefaultBacklogItemWithDetails,
} from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface ListServiceDefaultBacklogsItemsUseCaseRequest {
  serviceId: string;
  organizationId: string;
  userId: string;
  query?: string;
  priority?: BacklogPriority | null;
}

export class ListServiceDefaultBacklogsItemsUseCase {
  constructor(
    private serviceTypeRepository: IServiceTypeRepository,
    private serviceDefaultBacklogItemRepository: IServiceDefaultBacklogItemsRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    serviceId,
    query,
    priority,
  }: ListServiceDefaultBacklogsItemsUseCaseRequest): Promise<{
    totalOfRegisters: number;
    totalPoints: number;
    items: ServiceDefaultBacklogItemWithDetails[];
  }> {
    const serviceType = await this.serviceTypeRepository.findById(
      serviceId,
      organizationId,
    );

    if (!serviceType) {
      throw new ResourceNotFoundError("Serviço não localizado");
    }

    await checkUserPermissionForAsset("servicesBacklog", userId, serviceType, "READ");

    const defaultBacklogItems =
      await this.serviceDefaultBacklogItemRepository.findAll({
        organizationId,
        serviceTypeId: serviceId,
        query,
        priority,
      });

    return defaultBacklogItems;
  }
}
