import { IOrganizationsRepository } from "@/repositories/IOrganizationRepository";
import { ActivateOrganizationMemberUseCase } from "../organization/ActivateOrganizationMemberUseCase";

interface ActivatePendingMembersOnLoginUseCaseRequest {
  userId: string;
}

export class ActivatePendingMembersOnLoginUseCase {
  constructor(
    private organizationsRepository: IOrganizationsRepository,
    private activateOrganizationMemberUseCase: ActivateOrganizationMemberUseCase,
  ) {}

  async execute({
    userId,
  }: ActivatePendingMembersOnLoginUseCaseRequest): Promise<void> {
    const pendingMembers =
      await this.organizationsRepository.findPendingMembersByUserId(userId);

    for (const pendingMember of pendingMembers) {
      await this.activateOrganizationMemberUseCase.execute({
        memberId: pendingMember.id,
        organizationId: pendingMember.organizationId,
        userId,
      });
    }
  }
}
