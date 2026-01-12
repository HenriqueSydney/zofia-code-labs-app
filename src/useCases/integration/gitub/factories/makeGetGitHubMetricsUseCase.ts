import { IntegrationFactory } from "@/services/IntegrationFactory";
import { GetGitHubMetricsUseCase } from "../GetGitHubMetricsUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";

let getGitHubMetricsUseCase: GetGitHubMetricsUseCase;

export function makeGetGitHubMetricsUseCase() {
  if (!getGitHubMetricsUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const integrationFactory = new IntegrationFactory();

    getGitHubMetricsUseCase = new GetGitHubMetricsUseCase(
      projectIntegrationRepository,
      integrationFactory
    );
  }

  return getGitHubMetricsUseCase;
}
