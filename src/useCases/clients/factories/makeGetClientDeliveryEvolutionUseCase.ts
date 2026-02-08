import { GetClientDeliveryEvolutionUseCase } from "../GetClientDeliveryEvolutionUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let getClientDeliveryEvolutionUseCase: GetClientDeliveryEvolutionUseCase;

export function makeGetClientDeliveryEvolutionUseCase() {
  if (!getClientDeliveryEvolutionUseCase) {
    const clientRepository = makeClientRepository();
    getClientDeliveryEvolutionUseCase = new GetClientDeliveryEvolutionUseCase(
      clientRepository,
    );
  }

  return getClientDeliveryEvolutionUseCase;
}
