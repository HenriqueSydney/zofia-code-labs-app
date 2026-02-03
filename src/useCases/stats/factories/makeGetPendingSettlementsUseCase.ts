import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetPendingSettlementsUseCase } from "../GetPendingSettlementsUseCase";

let useCase: GetPendingSettlementsUseCase;

export function makeGetPendingSettlementsUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetPendingSettlementsUseCase(projectStatsRepository);
  }

  return useCase;
}
