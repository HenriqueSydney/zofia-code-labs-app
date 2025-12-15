import { ServiceType } from "@/generated/prisma/client";
import {
  FetchServiceTypeWithCategory,
  IServiceTypeRepository,
} from "@/repositories/IServiceTypeRepository";

interface FetchServiceTypeUseCaseRequest {
  query?: string | null;
}

export class FetchServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    query,
  }: FetchServiceTypeUseCaseRequest): Promise<{
    serviceTypes: FetchServiceTypeWithCategory[];
  }> {
    const serviceTypes = await this.serviceTypeRepository.list(query);

    return { serviceTypes };
  }
}
