import { GetProposalByIdUseCase } from "../GetProposalByIdUseCase";

import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let getProposalByIdUseCase: GetProposalByIdUseCase;

export function makeGetProposalByIdUseCase() {
  if (!getProposalByIdUseCase) {
    const proposalRepository = makeProposalRepository();
    getProposalByIdUseCase = new GetProposalByIdUseCase(proposalRepository);
  }

  return getProposalByIdUseCase;
}
