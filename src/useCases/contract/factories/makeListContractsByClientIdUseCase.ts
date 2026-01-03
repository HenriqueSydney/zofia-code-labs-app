import { makeClientRepository } from "@/repositories/factories/makeClientRepository";
import { ListContractsByClientSlugUseCase } from "../ListContractsByClientSlugUseCase";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";

let listContractsByClientSlugUseCase: ListContractsByClientSlugUseCase;

export function makeListContractsByClientSlugUseCase() {
  if (!listContractsByClientSlugUseCase) {
    const clientRepository = makeClientRepository();
    const contractRepository = makeContractRepository();
    listContractsByClientSlugUseCase = new ListContractsByClientSlugUseCase(
      clientRepository,
      contractRepository
    );
  }

  return listContractsByClientSlugUseCase;
}
