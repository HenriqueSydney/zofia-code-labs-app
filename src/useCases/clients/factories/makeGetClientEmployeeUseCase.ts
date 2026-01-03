import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { GetClientEmployeeUseCase } from "../GetClientEmployeeUseCase";

let getClientEmployeeUseCase: GetClientEmployeeUseCase;

export function makeGetClientEmployeeUseCase() {
  if (!getClientEmployeeUseCase) {
    const clientEmployeeRepository = makeClientEmployeesRepository();
    getClientEmployeeUseCase = new GetClientEmployeeUseCase(
      clientEmployeeRepository
    );
  }

  return getClientEmployeeUseCase;
}
