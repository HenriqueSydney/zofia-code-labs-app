import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  FetchServiceTypeWithCategory,
  IServiceTypeRepository,
} from "@/repositories/IServiceTypeRepository";

interface GetServiceTypeUseCaseRequest {
  serviceId: string;
  organizationId: string;
  userId: string;
}

export class GetServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    organizationId,
    serviceId,
    userId,
  }: GetServiceTypeUseCaseRequest): Promise<{
    serviceType: FetchServiceTypeWithCategory;
  }> {
    const serviceType = await this.serviceTypeRepository.findById(
      serviceId,
      organizationId,
    );

    if (!serviceType) {
      throw new ResourceNotFoundError("Serviço não localizado");
    }
    
    await checkUserPermissionForAsset(
      "serviceType",
      userId,
      serviceType,
      "READ",
    );

    return { serviceType };
  }
}
