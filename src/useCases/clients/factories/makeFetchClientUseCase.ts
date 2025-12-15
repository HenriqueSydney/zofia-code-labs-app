import { PrismaClientsRepository } from "@/repositories/prisma/PrismaClientRepository";
import { FetchClientUseCase } from "../FetchClientUseCase";

let fetchClientUseCase: FetchClientUseCase;

export function makeFetchClientUseCase() {
  if (!fetchClientUseCase) {
    const clientRepository = new PrismaClientsRepository();
    fetchClientUseCase = new FetchClientUseCase(clientRepository);
  }

  return fetchClientUseCase;
}
