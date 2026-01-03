import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { ListClientEmployeeUseCase } from "../ListClientEmployeeUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let listClientEmployeeUseCase: ListClientEmployeeUseCase;

export function makeListClientEmployeeUseCase() {
  if (!listClientEmployeeUseCase) {
    const clientEmployeeRepository = makeClientEmployeesRepository();
    const clientRepository = makeClientRepository();
    listClientEmployeeUseCase = new ListClientEmployeeUseCase(
      clientEmployeeRepository,
      clientRepository
    );
  }

  return listClientEmployeeUseCase;
}
