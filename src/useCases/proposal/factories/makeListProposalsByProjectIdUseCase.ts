import { ListProposalsByProjectIdUseCase } from "../ListProposalsByProjectIdUseCase";
import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";

let listProposalsByProjectIdUseCase: ListProposalsByProjectIdUseCase;

export function makeListProposalsByProjectIdUseCase() {
  if (!listProposalsByProjectIdUseCase) {
    const proposalRepository = makeProposalRepository();
    listProposalsByProjectIdUseCase = new ListProposalsByProjectIdUseCase(
      proposalRepository
    );
  }

  return listProposalsByProjectIdUseCase;
}
