import { GetSonarQubeHistoryUseCase } from "../GetSonarQubeHistoryUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { makeSonarQubeRepository } from "@/repositories/factories/makeSonarQubeRepository";

let getSonarQubeHistoryUseCase: GetSonarQubeHistoryUseCase;

export function makeGetSonarQubeHistoryUseCase() {
  if (!getSonarQubeHistoryUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const sonarQubeRepository = makeSonarQubeRepository();

    getSonarQubeHistoryUseCase = new GetSonarQubeHistoryUseCase(
      projectIntegrationRepository,
      sonarQubeRepository
    );
  }

  return getSonarQubeHistoryUseCase;
}
