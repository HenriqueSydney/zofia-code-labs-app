import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetProjectsVolumeChartUseCase } from "../GetProjectsVolumeChartUseCase";

let useCase: GetProjectsVolumeChartUseCase;

export function makeGetProjectsVolumeChartUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetProjectsVolumeChartUseCase(projectStatsRepository);
  }

  return useCase;
}
