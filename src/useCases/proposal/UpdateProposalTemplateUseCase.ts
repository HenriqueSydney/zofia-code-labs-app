import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProposalRepository } from "@/repositories/IProposalRepository";
import { IProposalTemplateRepository } from "@/repositories/IProposalTemplateRepository";
type CreateProposalUseCaseParams = {
  proposalId: string;
  newContent: any;
  organizationId: string;
  userId: string;
};

export class UpdateProposalTemplateUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private proposalTemplateRepository: IProposalTemplateRepository
  ) {}

  async execute(
    data: CreateProposalUseCaseParams
  ): Promise<{ projectId: string }> {
    const proposal = await this.proposalRepository.findById(data.proposalId);

    if (!proposal) {
      throw new AppError("Proposta não localizada");
    }

    if (!proposal.proposalTemplate) {
      throw new AppError("Proposta não foi gerada pelo sistema");
    }

    await checkUserPermissionForAsset(
      "proposal",
      data.userId,
      proposal,
      "UPDATE"
    );

    await this.proposalTemplateRepository.update(proposal.proposalTemplate.id, {
      proposalId: proposal.id,
      content: data.newContent,
    });

    return { projectId: proposal.projectId };
  }
}
