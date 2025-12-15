import { PrismaClientsRepository } from "@/repositories/prisma/PrismaClientRepository";
import { UpdateClientUseCase } from "../UpdateClientUseCase";

let updateClientUseCase: UpdateClientUseCase;

export function makeUpdateClientUseCase() {
  if (!updateClientUseCase) {
    const clientRepository = new PrismaClientsRepository();
    updateClientUseCase = new UpdateClientUseCase(clientRepository);
  }

  return updateClientUseCase;
}
