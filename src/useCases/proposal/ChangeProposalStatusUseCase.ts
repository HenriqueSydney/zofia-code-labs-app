import { AppError } from "@/errors/AppError";
import { ProposalStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IProposalRepository } from "@/repositories/IProposalRepository";

interface ChangeProposalStatusRequest {
  proposalId: string;
  newStatus: ProposalStatus;
  userId: string; // Para garantir que o usuário é dono da proposta
}

export class ChangeProposalStatusUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute({
    proposalId,
    newStatus,
    userId,
  }: ChangeProposalStatusRequest): Promise<void> {
    // 1. Buscar a proposta
    const proposal = await this.proposalRepository.findById(proposalId);

    if (!proposal) {
      throw new AppError("Proposta não encontrada.", 404);
    }

    if (!this.isValidTransition(proposal.status, newStatus)) {
      throw new AppError(
        `Não é possível alterar o status de ${proposal.status} para ${newStatus}.`,
        400
      );
    }

    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { proposal, organizationId: proposal.project.organizationId },
      "UPDATE"
    );

    if (newStatus === ProposalStatus.ACCEPTED) {
      // TODO: Aqui você poderia disparar a criação automática do Projeto
      // await this.createProjectFromProposal.execute(proposal);
    }

    await prisma.$transaction(async (tx) => {
      await this.proposalRepository.updateStatus(proposalId, newStatus, tx);
      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: proposal.projectId ?? "",
          action: "PROPOSAL_STATUS_CHANGE",
          userId,
          changes: { status: { from: proposal.status, to: newStatus } },
          metadata: {
            proposalId: proposal.id,
          },
        },
        tx
      );
    });
  }

  // Helper para validar a transição (State Machine Guard)
  private isValidTransition(
    current: ProposalStatus,
    next: ProposalStatus
  ): boolean {
    // Se o status for o mesmo, permite (idempotência) ou bloqueia, depende da sua preferência.
    if (current === next) return true;

    const allowedTransitions: Record<ProposalStatus, ProposalStatus[]> = {
      [ProposalStatus.DRAFT]: [ProposalStatus.REVIEW, ProposalStatus.REJECTED],
      [ProposalStatus.REVIEW]: [
        ProposalStatus.DRAFT,
        ProposalStatus.APPROVED,
        ProposalStatus.REJECTED,
      ],
      [ProposalStatus.APPROVED]: [
        ProposalStatus.REVIEW,
        ProposalStatus.SENT,
        ProposalStatus.REJECTED,
      ],
      [ProposalStatus.SENT]: [
        ProposalStatus.ACCEPTED,
        ProposalStatus.REJECTED,
        ProposalStatus.DRAFT,
      ],
      [ProposalStatus.ACCEPTED]: [ProposalStatus.REJECTED], // Cancelamento
      [ProposalStatus.REJECTED]: [ProposalStatus.DRAFT],
    };

    return allowedTransitions[current]?.includes(next) ?? false;
  }
}
