import { GetClientUseCase } from "../GetClientUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let getClientUseCase: GetClientUseCase;

export function makeGetClientUseCase() {
  if (!getClientUseCase) {
    const clientRepository = makeClientRepository();
    getClientUseCase = new GetClientUseCase(clientRepository);
  }

  return getClientUseCase;
}
