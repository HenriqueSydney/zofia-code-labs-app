import { DeleteClientUseCase } from "../DeleteClientUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let deleteClientUseCase: DeleteClientUseCase;

export function makeDeleteClientUseCase() {
  if (!deleteClientUseCase) {
    const clientRepository = makeClientRepository();
    deleteClientUseCase = new DeleteClientUseCase(clientRepository);
  }

  return deleteClientUseCase;
}
