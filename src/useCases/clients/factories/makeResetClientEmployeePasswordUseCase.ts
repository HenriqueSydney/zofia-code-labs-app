import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { ResetClientEmployeePasswordUseCase } from "../ResetClientEmployeePasswordUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";

let resetClientEmployeePasswordUseCase: ResetClientEmployeePasswordUseCase;

export function makeResetClientEmployeePasswordUseCase() {
  if (!resetClientEmployeePasswordUseCase) {
    const clientEmployeeRepository = makeClientEmployeesRepository();
    const clientRepository = makeClientRepository();
    const userRepository = makeUserRepository();
    resetClientEmployeePasswordUseCase = new ResetClientEmployeePasswordUseCase(
      clientEmployeeRepository,
      clientRepository,
      userRepository
    );
  }

  return resetClientEmployeePasswordUseCase;
}
