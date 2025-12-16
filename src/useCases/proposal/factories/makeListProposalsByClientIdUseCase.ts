import { ListProposalsByClientIdUseCase } from "../ListProposalsByClientIdUseCase";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let listProposalsByClientIdUseCase: ListProposalsByClientIdUseCase;

export function makeListProposalsByClientIdUseCase() {
  if (!listProposalsByClientIdUseCase) {
    const proposalRepository = makeProposalRepository();
    listProposalsByClientIdUseCase = new ListProposalsByClientIdUseCase(
      proposalRepository
    );
  }

  return listProposalsByClientIdUseCase;
}
