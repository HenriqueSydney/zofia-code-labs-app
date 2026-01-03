import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { DeleteClientEmployeeUseCase } from "../DeleteClientEmployeeUseCase";

let deleteClientEmployeeUseCase: DeleteClientEmployeeUseCase;

export function makeDeleteClientEmployeeUseCase() {
  if (!deleteClientEmployeeUseCase) {
    const clientEmployeeRepository = makeClientEmployeesRepository();
    deleteClientEmployeeUseCase = new DeleteClientEmployeeUseCase(
      clientEmployeeRepository
    );
  }

  return deleteClientEmployeeUseCase;
}
