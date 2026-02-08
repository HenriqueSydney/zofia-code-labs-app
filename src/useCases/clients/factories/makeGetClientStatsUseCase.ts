import { GetClientStatsUseCase } from "../GetClientStatsUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let getClientStatsUseCase: GetClientStatsUseCase;

export function makeGetClientStatsUseCase() {
  if (!getClientStatsUseCase) {
    const clientRepository = makeClientRepository();
    getClientStatsUseCase = new GetClientStatsUseCase(clientRepository);
  }

  return getClientStatsUseCase;
}
