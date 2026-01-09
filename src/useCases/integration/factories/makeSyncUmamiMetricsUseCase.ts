import { SyncUmamiMetricsUseCase } from "../SyncUmamiMetricsUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { IntegrationFactory } from "@/services/IntegrationFactory";
import { makeUmamiRepository } from "@/repositories/factories/makeUmamiRepository";

let syncUmamiMetricsUseCase: SyncUmamiMetricsUseCase;

export function makeSyncUmamiMetricsUseCase() {
  if (!syncUmamiMetricsUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const umamiRepository = makeUmamiRepository();
    const integrationFactory = new IntegrationFactory();

    syncUmamiMetricsUseCase = new SyncUmamiMetricsUseCase(
      projectIntegrationRepository,
      umamiRepository,
      integrationFactory
    );
  }

  return syncUmamiMetricsUseCase;
}
