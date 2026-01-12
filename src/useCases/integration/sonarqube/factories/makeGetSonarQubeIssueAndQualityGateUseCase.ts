import { GetSonarQubeIssueAndQualityGateUseCase } from "../GetSonarQubeIssueAndQualityGateUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { IntegrationFactory } from "@/services/IntegrationFactory";

let getSonarQubeIssueAndQualityGateUseCase: GetSonarQubeIssueAndQualityGateUseCase;

export function makeGetSonarQubeIssueAndQualityGateUseCase() {
  if (!getSonarQubeIssueAndQualityGateUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const integrationFactory = new IntegrationFactory();

    getSonarQubeIssueAndQualityGateUseCase =
      new GetSonarQubeIssueAndQualityGateUseCase(
        projectIntegrationRepository,
        integrationFactory
      );
  }

  return getSonarQubeIssueAndQualityGateUseCase;
}
