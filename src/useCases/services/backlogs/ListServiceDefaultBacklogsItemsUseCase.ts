import { AppError } from "@/errors/AppError";
import { BacklogPriority } from "@/generated/prisma/enums";
import {
  IServiceDefaultBacklogItemsRepository,
  ServiceDefaultBacklogItemWithDetails,
} from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface ListServiceDefaultBacklogsItemsUseCaseRequest {
  serviceId: string;
  organizationId: string;
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
      throw new AppError("Serviço não localizado");
    }

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
