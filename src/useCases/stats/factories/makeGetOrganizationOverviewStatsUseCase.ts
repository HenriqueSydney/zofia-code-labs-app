import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";
import { GetOrganizationOverviewStatsUseCase } from "../GetOrganizationOverviewStatsUseCase";

let useCase: GetOrganizationOverviewStatsUseCase;

export function makeGetOrganizationOverviewStatsUseCase() {
  if (!useCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    useCase = new GetOrganizationOverviewStatsUseCase(projectStatsRepository);
  }

  return useCase;
}
