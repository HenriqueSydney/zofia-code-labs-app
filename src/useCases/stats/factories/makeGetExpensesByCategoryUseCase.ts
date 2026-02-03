import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetExpensesByCategoryUseCase } from "../GetExpensesByCategoryUseCase";

let useCase: GetExpensesByCategoryUseCase;

export function makeGetExpensesByCategoryUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetExpensesByCategoryUseCase(projectStatsRepository);
  }

  return useCase;
}
