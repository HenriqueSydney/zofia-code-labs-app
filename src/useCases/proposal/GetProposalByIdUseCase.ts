import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProposalRepository } from "@/repositories/IProposalRepository";

interface IGetProposalByIdUseCase {
  id: string;
  userId: string;
}

export class GetProposalByIdUseCase {
  constructor(private proposalRepository: IProposalRepository) {}

  async execute({ id, userId }: IGetProposalByIdUseCase) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new ResourceNotFoundError("Proposal not found");
    }

    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { organizationId: proposal.project.organizationId },
      "READ"
    );

    return proposal;
  }
}
