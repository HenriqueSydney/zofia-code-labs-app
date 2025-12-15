import { PrismaClientsRepository } from "@/repositories/prisma/PrismaClientRepository";
import { CreateClientUseCase } from "../CreateClientUseCase";

let createClientUseCase: CreateClientUseCase;

export function makeCreateClientUseCase() {
  if (!createClientUseCase) {
    const clientRepository = new PrismaClientsRepository();
    createClientUseCase = new CreateClientUseCase(clientRepository);
  }

  return createClientUseCase;
}
