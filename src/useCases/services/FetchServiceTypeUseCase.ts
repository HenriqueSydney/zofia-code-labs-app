
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  FetchServiceTypeWithCategory,
  IServiceTypeRepository,
} from "@/repositories/IServiceTypeRepository";

interface FetchServiceTypeUseCaseRequest {
  query?: string | null;
  userId: string;
  organizationId: string;
}

export class FetchServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    query,
    userId,
    organizationId,
  }: FetchServiceTypeUseCaseRequest): Promise<{
    serviceTypes: FetchServiceTypeWithCategory[];
  }> {
    const serviceTypes = await this.serviceTypeRepository.list(organizationId, query);
    await checkUserPermissionForAsset(
      "serviceType",
      userId,
      serviceTypes[0],
      "READ",
    );

    return { serviceTypes };
  }
}
