import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IProposalRepository } from "@/repositories/IProposalRepository";

interface DeleteProposalUseCaseParams {
  id: string;
  userId: string;
}

export class DeleteProposalUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute({ id, userId }: DeleteProposalUseCaseParams) {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    await checkUserPermissionForAsset("proposal", userId, proposal, "DELETE");

    // Regra de negócio: Talvez impedir deletar propostas já ACEITAS?
    if (proposal.status === "ACCEPTED") {
      throw new Error("Cannot delete an accepted proposal");
    }

    await prisma.$transaction(async (tx) => {
      await this.proposalRepository.delete(id, tx);
      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: proposal.generatedProjectId ?? "",
          action: "PROPOSAL_STATUS_CHANGE",
          userId,
          changes: { status: { from: proposal.status, to: "REJECTED" } },
          metadata: {
            proposalId: proposal.id,
          },
        },
        tx
      );
    });
  }
}
