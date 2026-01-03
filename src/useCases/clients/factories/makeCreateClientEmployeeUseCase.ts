import { makeClientEmployeesRepository } from "@/repositories/factories/makeClientEmployeesRepository";
import { CreateClientEmployeeUseCase } from "../CreateClientEmployeeUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";

let createClientEmployeeUseCase: CreateClientEmployeeUseCase;

export function makeCreateClientEmployeeUseCase() {
  if (!createClientEmployeeUseCase) {
    const clientEmployeeRepository = makeClientEmployeesRepository();
    const clientRepository = makeClientRepository();
    const userRepository = makeUserRepository();
    createClientEmployeeUseCase = new CreateClientEmployeeUseCase(
      clientEmployeeRepository,
      clientRepository,
      userRepository
    );
  }

  return createClientEmployeeUseCase;
}
