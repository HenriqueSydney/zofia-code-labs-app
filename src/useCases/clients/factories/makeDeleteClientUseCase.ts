import { PrismaClientsRepository } from "@/repositories/prisma/PrismaClientRepository";
import { DeleteClientUseCase } from "../DeleteClientUseCase";

let deleteClientUseCase: DeleteClientUseCase;

export function makeDeleteClientUseCase() {
  if (!deleteClientUseCase) {
    const clientRepository = new PrismaClientsRepository();
    deleteClientUseCase = new DeleteClientUseCase(clientRepository);
  }

  return deleteClientUseCase;
}
