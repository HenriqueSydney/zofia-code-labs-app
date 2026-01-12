import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetFinancialMetricsUseCase } from "../GetFinancialMetricsUseCase";
import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";

let getFinancialMetricsUseCase: GetFinancialMetricsUseCase;

export function makeGetFinancialMetricsUseCase() {
  if (!getFinancialMetricsUseCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    const projectRepository = makeProjectRepository();
    getFinancialMetricsUseCase = new GetFinancialMetricsUseCase(
      projectStatsRepository,
      projectRepository
    );
  }

  return getFinancialMetricsUseCase;
}
