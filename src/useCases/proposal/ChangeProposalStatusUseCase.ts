import { AppError } from "@/errors/AppError";
import { Proposal } from "@/generated/prisma/client";
import { ProposalStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IProposalRepository } from "@/repositories/IProposalRepository";
import { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";

interface ChangeProposalStatusRequest {
  proposalId: string;
  newStatus: ProposalStatus;
  userId: string;
  communicationChannel?: "whatsapp" | "email";
}

export class ChangeProposalStatusUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private chageProjectStatusUseCase: ChangeProjectStatusUseCase,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute({
    proposalId,
    newStatus,
    userId,
    communicationChannel,
  }: ChangeProposalStatusRequest): Promise<Proposal> {
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

    const updatedProposal = await prisma.$transaction(async (tx) => {
      const proposal = await this.proposalRepository.updateStatus(
        proposalId,
        newStatus,
        tx
      );

      if (newStatus === "SENT" && communicationChannel) {
        console.log({ sent: communicationChannel });
      }

      if (newStatus === "ACCEPTED") {
        await this.chageProjectStatusUseCase.execute(
          {
            projectId: proposal.projectId,
            newStatus: "PROPOSAL_GENERATED",
            data: { observation: "Proposta aceita pelo cliente." },
            userId: userId,
          },
          tx
        );
      }

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
      return proposal;
    });

    return updatedProposal;
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
        ProposalStatus.CANCELLED,
      ],
      [ProposalStatus.APPROVED]: [
        ProposalStatus.REVIEW,
        ProposalStatus.SENT,
        ProposalStatus.REJECTED,
        ProposalStatus.CANCELLED,
      ],
      [ProposalStatus.SENT]: [
        ProposalStatus.ACCEPTED,
        ProposalStatus.REJECTED,
        ProposalStatus.CANCELLED,
        ProposalStatus.DRAFT,
      ],
      [ProposalStatus.ACCEPTED]: [ProposalStatus.REJECTED], // Cancelamento
      [ProposalStatus.REJECTED]: [ProposalStatus.DRAFT],
      [ProposalStatus.CANCELLED]: [],
    };

    return allowedTransitions[current]?.includes(next) ?? false;
  }
}
