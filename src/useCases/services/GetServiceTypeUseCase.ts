import { AppError } from "@/errors/AppError";
import {
  FetchServiceTypeWithCategory,
  IServiceTypeRepository,
} from "@/repositories/IServiceTypeRepository";

interface GetServiceTypeUseCaseRequest {
  serviceId: string;
  organizationId: string;
}

export class GetServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    organizationId,
    serviceId,
  }: GetServiceTypeUseCaseRequest): Promise<{
    serviceType: FetchServiceTypeWithCategory;
  }> {
    const serviceType = await this.serviceTypeRepository.findById(
      serviceId,
      organizationId,
    );

    if (!serviceType) {
      throw new AppError("Serviço não localizado");
    }

    return { serviceType };
  }
}
