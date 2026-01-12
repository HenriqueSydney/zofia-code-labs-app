import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetSprintMetricsUseCase } from "../GetSprintMetricsUseCase";
import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";

let getSprintMetricsUseCase: GetSprintMetricsUseCase;

export function makeGetSprintMetricsUseCase() {
  if (!getSprintMetricsUseCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    const projectRepository = makeProjectRepository();
    getSprintMetricsUseCase = new GetSprintMetricsUseCase(
      projectStatsRepository,
      projectRepository
    );
  }

  return getSprintMetricsUseCase;
}
