import { GetClientBlockersUseCase } from "../GetClientBlockersUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let getClientBlockersUseCase: GetClientBlockersUseCase;

export function makeGetClientBlockersUseCase() {
  if (!getClientBlockersUseCase) {
    const clientRepository = makeClientRepository();
    getClientBlockersUseCase = new GetClientBlockersUseCase(clientRepository);
  }

  return getClientBlockersUseCase;
}
