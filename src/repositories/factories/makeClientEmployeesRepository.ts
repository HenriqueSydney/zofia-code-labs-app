import { IClientEmployeesRepository } from "../IClientEmployeesRepository";
import { PrismaClientEmployeesRepository } from "../prisma/PrismaClientEmployeesRepository";

let clientEmployeesRepo: IClientEmployeesRepository | null = null;

export function makeClientEmployeesRepository() {
  if (!clientEmployeesRepo) {
    clientEmployeesRepo = new PrismaClientEmployeesRepository();
  }
  return clientEmployeesRepo;
}
