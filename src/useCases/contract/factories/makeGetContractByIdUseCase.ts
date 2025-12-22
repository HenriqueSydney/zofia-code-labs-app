import { GetContractByIdUseCase } from "../GetContractByIdUseCase";

import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let getContractByIdUseCase: GetContractByIdUseCase;

export function makeGetContractByIdUseCase() {
  if (!getContractByIdUseCase) {
    const contractRepository = makeContractRepository();
    getContractByIdUseCase = new GetContractByIdUseCase(contractRepository);
  }

  return getContractByIdUseCase;
}
