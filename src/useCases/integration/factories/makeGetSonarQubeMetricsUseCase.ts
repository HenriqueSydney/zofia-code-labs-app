import { GetSonarQubeMetricsUseCase } from "../GetSonarQubeMetricsUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { makeSonarQubeRepository } from "@/repositories/factories/makeSonarQubeRepository";

let getSonarQubeMetricsUseCase: GetSonarQubeMetricsUseCase;

export function makeGetSonarQubeMetricsUseCase() {
  if (!getSonarQubeMetricsUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const sonarQubeRepository = makeSonarQubeRepository();

    getSonarQubeMetricsUseCase = new GetSonarQubeMetricsUseCase(
      projectIntegrationRepository,
      sonarQubeRepository
    );
  }

  return getSonarQubeMetricsUseCase;
}
