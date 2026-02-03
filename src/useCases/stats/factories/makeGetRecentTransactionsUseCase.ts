import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetRecentTransactionsUseCase } from "../GetRecentTransactionsUseCase";

let useCase: GetRecentTransactionsUseCase;

export function makeGetRecentTransactionsUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetRecentTransactionsUseCase(projectStatsRepository);
  }

  return useCase;
}
