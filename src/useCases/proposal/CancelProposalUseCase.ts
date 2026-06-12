import { ResourceNotFoundError, BusinessRuleError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IProposalRepository } from "@/repositories/IProposalRepository";

interface CancelProposalUseCaseParams {
  id: string;
  userId: string;
}

export class CancelProposalUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute({ id, userId }: CancelProposalUseCaseParams): Promise<{
    clientSlug: string;
    projectSlug: string;
  }> {
    const proposal = await this.proposalRepository.findById(id);

    if (!proposal) {
      throw new ResourceNotFoundError("Proposta não localizada");
    }

    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { organizationId: proposal.project.organizationId },
      "DELETE"
    );

    // Regra de negócio: Talvez impedir deletar propostas já ACEITAS?
    // if (proposal.status === "ACCEPTED") {
    //   throw new BusinessRuleError("Não é possível excluir uma proposta aceita");
    // }

    // if (proposal.status === "REJECTED") {
    //   throw new BusinessRuleError("Não é possível excluir uma proposta rejeitada");
    // }

    await prisma.$transaction(async (tx) => {
      await this.proposalRepository.cancel(id, tx);
      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: proposal.projectId ?? "",
          action: "PROPOSAL_STATUS_CHANGE",
          userId,
          changes: { status: { from: proposal.status, to: "CANCELLED" } },
          metadata: {
            proposalId: proposal.id,
          },
        },
        tx
      );
    });

    return {
      clientSlug: proposal.project.client.slug,
      projectSlug: proposal.project.slug,
    };
  }
}
