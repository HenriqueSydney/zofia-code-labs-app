import { GetUmamiMetricsUseCase } from "../GetUmamiMetricsUseCase";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import { makeUmamiRepository } from "@/repositories/factories/makeUmamiRepository";

let getUmamiMetricsUseCase: GetUmamiMetricsUseCase;

export function makeGetUmamiMetricsUseCase() {
  if (!getUmamiMetricsUseCase) {
    const projectIntegrationRepository = makeProjectIntegrationRepository();
    const umamiRepository = makeUmamiRepository();

    getUmamiMetricsUseCase = new GetUmamiMetricsUseCase(
      projectIntegrationRepository,
      umamiRepository
    );
  }

  return getUmamiMetricsUseCase;
}
