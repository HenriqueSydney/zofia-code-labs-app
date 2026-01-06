import { SyncSonarQubeMetricsUseCase } from "../SyncSonarQubeMetricsUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { IntegrationFactory } from "@/services/IntegrationFactory";
import { makeSonarQubeRepository } from "@/repositories/factories/makeSonarQubeRepository";

let syncSonarQubeMetricsUseCase: SyncSonarQubeMetricsUseCase;

export function makeSyncSonarQubeMetricsUseCase() {
  if (!syncSonarQubeMetricsUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const sonarQubeRepository = makeSonarQubeRepository();
    const integrationFactory = new IntegrationFactory();

    syncSonarQubeMetricsUseCase = new SyncSonarQubeMetricsUseCase(
      projectIntegrationRepository,
      sonarQubeRepository,
      integrationFactory
    );
  }

  return syncSonarQubeMetricsUseCase;
}
