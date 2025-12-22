import { ListContractsByProjectIdUseCase } from "../ListContractsByProjectIdUseCase";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let listContractsByProjectIdUseCase: ListContractsByProjectIdUseCase;

export function makeListContractsByProjectIdUseCase() {
  if (!listContractsByProjectIdUseCase) {
    const contractRepository = makeContractRepository();
    listContractsByProjectIdUseCase = new ListContractsByProjectIdUseCase(
      contractRepository
    );
  }

  return listContractsByProjectIdUseCase;
}
