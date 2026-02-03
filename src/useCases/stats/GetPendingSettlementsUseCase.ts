// useCases/financial/GetPendingSettlementsUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IRequest {
  organizationId: string;
  userId: string;
}

export class GetPendingSettlementsUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId }: IRequest) {
    const settlements =
      await this.statsRepo.getPendingSettlements(organizationId);

    return settlements;
  }
}
