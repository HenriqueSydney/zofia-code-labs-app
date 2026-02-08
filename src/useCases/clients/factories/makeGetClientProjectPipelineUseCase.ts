import { GetClientProjectPipelineUseCase } from "../GetClientProjectPipelineUseCase";
import { makeClientRepository } from "@/repositories/factories/makeClientRepository";

let getClientProjectPipelineUseCase: GetClientProjectPipelineUseCase;

export function makeGetClientProjectPipelineUseCase() {
  if (!getClientProjectPipelineUseCase) {
    const clientRepository = makeClientRepository();
    getClientProjectPipelineUseCase = new GetClientProjectPipelineUseCase(
      clientRepository,
    );
  }

  return getClientProjectPipelineUseCase;
}
