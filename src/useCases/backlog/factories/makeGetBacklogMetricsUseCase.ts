import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetBacklogMetricsUseCase } from "../GetBacklogMetricsUseCase";
import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";

let getBacklogMetricsUseCase: GetBacklogMetricsUseCase;

export function makeGetBacklogMetricsUseCase() {
  if (!getBacklogMetricsUseCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    const projectRepository = makeProjectRepository();
    getBacklogMetricsUseCase = new GetBacklogMetricsUseCase(
      projectStatsRepository,
      projectRepository
    );
  }

  return getBacklogMetricsUseCase;
}
