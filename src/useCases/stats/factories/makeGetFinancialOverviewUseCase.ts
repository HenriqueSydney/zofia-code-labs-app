import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetFinancialOverviewUseCase } from "../GetFinancialOverviewUseCase";

let useCase: GetFinancialOverviewUseCase;

export function makeGetFinancialOverviewUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetFinancialOverviewUseCase(projectStatsRepository);
  }

  return useCase;
}
