import { ResourceNotFoundError, ValidationError } from "@/errors";
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
    private proposalTemplateRepository: IProposalTemplateRepository,
  ) {}

  async execute(
    data: CreateProposalUseCaseParams,
  ): Promise<{ projectId: string; slug: string; clientSlug: string }> {
    const proposal = await this.proposalRepository.findById(data.proposalId);

    if (!proposal) {
      throw new ResourceNotFoundError("Proposta não localizada");
    }

    if (!proposal.proposalTemplate) {
      throw new ValidationError("Proposta sem snapshot de documento");
    }

    await checkUserPermissionForAsset(
      "proposal",
      data.userId,
      proposal,
      "UPDATE",
    );

    await this.proposalTemplateRepository.update(proposal.proposalTemplate.id, {
      proposalId: proposal.id,
      content: data.newContent,
    });

    return {
      projectId: proposal.projectId,
      slug: proposal.project.slug,
      clientSlug: proposal.project.client.slug,
    };
  }
}
