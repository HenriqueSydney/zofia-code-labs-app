import { PrismaClientsRepository } from "@/repositories/prisma/PrismaClientRepository";
import { FetchClientUseCase } from "../FetchClientUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let fetchClientUseCase: FetchClientUseCase;

export function makeFetchClientUseCase() {
  if (!fetchClientUseCase) {
    const clientRepository = makeClientRepository();
    fetchClientUseCase = new FetchClientUseCase(clientRepository);
  }

  return fetchClientUseCase;
}
