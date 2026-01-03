import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { UpdateClientEmployeeUseCase } from "../UpdateClientEmployeeUseCase";

let updateClientEmployeeUseCase: UpdateClientEmployeeUseCase;

export function makeUpdateClientEmployeeUseCase() {
  if (!updateClientEmployeeUseCase) {
    const clientEmployeeRepository = makeClientEmployeesRepository();
    updateClientEmployeeUseCase = new UpdateClientEmployeeUseCase(
      clientEmployeeRepository
    );
  }

  return updateClientEmployeeUseCase;
}
