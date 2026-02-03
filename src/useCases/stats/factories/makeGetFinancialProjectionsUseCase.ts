import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetFinancialProjectionsUseCase } from "../GetFinancialProjectionsUseCase";

let useCase: GetFinancialProjectionsUseCase;

export function makeGetFinancialProjectionsUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetFinancialProjectionsUseCase(projectStatsRepository);
  }

  return useCase;
}
