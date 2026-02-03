import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetRecentProjectsUseCase } from "../GetRecentProjectsUseCase";

let useCase: GetRecentProjectsUseCase;

export function makeGetRecentProjectsUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetRecentProjectsUseCase(projectStatsRepository);
  }

  return useCase;
}
