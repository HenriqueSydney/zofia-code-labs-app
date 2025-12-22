import { ListContractsByClientIdUseCase } from "../ListContractsByClientIdUseCase";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let listContractsByClientIdUseCase: ListContractsByClientIdUseCase;

export function makeListContractsByClientIdUseCase() {
  if (!listContractsByClientIdUseCase) {
    const contractRepository = makeContractRepository();
    listContractsByClientIdUseCase = new ListContractsByClientIdUseCase(
      contractRepository
    );
  }

  return listContractsByClientIdUseCase;
}
