import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeProposalTemplateRepository } from "@/repositories/factories/makeProposalTemplateRepository";
import { UpdateProposalTemplateUseCase } from "../UpdateProposalTemplateUseCase";

let updateProposalTemplateUseCase: UpdateProposalTemplateUseCase;

export function makeUpdateProposalTemplateUseCase() {
  if (!updateProposalTemplateUseCase) {
    const proposalRepository = makeProposalRepository();
    const proposalTemplateRepository = makeProposalTemplateRepository();
    updateProposalTemplateUseCase = new UpdateProposalTemplateUseCase(
      proposalRepository,
      proposalTemplateRepository
    );
  }

  return updateProposalTemplateUseCase;
}
