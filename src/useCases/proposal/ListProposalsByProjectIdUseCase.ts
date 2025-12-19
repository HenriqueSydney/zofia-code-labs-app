import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProposalRepository } from "@/repositories/IProposalRepository";

interface ListProposalsByProjectIdUseCaseParams {
  projectId: string;
  userId: string;
  organizationId: string;
}

export class ListProposalsByProjectIdUseCase {
  constructor(private proposalRepository: IProposalRepository) {}

  async execute({
    projectId,
    userId,
    organizationId,
  }: ListProposalsByProjectIdUseCaseParams) {
    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { organizationId },
      "READ"
    );
    return await this.proposalRepository.getHistory(projectId);
  }
}
