import { IClientsRepository } from "../IClientsRepository";
import { PrismaClientsRepository } from "../prisma/PrismaClientRepository";

let clientRepo: IClientsRepository | null = null;

export function makeClientRepository() {
  if (!clientRepo) {
    clientRepo = new PrismaClientsRepository();
  }
  return clientRepo;
}
