import { ListAllContractsUseCase } from "../ListAllContractsUseCase";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let listAllContractsUseCase: ListAllContractsUseCase;

export function makeListAllContractsUseCase() {
  if (!listAllContractsUseCase) {
    const contractRepository = makeContractRepository();
    listAllContractsUseCase = new ListAllContractsUseCase(contractRepository);
  }

  return listAllContractsUseCase;
}
