import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProposalRepository } from "@/repositories/IProposalRepository";

interface ListProposalsByClientIdUseCaseParams {
  clientId: string;
  userId: string;
  organizationId: string;
}

export class ListProposalsByClientIdUseCase {
  constructor(private proposalRepository: IProposalRepository) {}

  async execute({
    clientId,
    userId,
    organizationId,
  }: ListProposalsByClientIdUseCaseParams) {
    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { organizationId },
      "READ"
    );
    return await this.proposalRepository.findAllByClient(clientId);
  }
}
