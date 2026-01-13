import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { GetCommercialStatsUseCase } from "../GetCommercialStatsUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";
import { makeProjectStatsRepository } from "@/repositories/factories/makeProjectStatsRepository";

let getCommercialStatsUseCase: GetCommercialStatsUseCase;

export function makeGetCommercialStatsUseCase() {
  if (!getCommercialStatsUseCase) {
    const projectStatsRepository = makeProjectStatsRepository();
    const projectRepository = makeProjectRepository();
    getCommercialStatsUseCase = new GetCommercialStatsUseCase(
      projectStatsRepository,
      projectRepository
    );
  }

  return getCommercialStatsUseCase;
}
