import {
  ResourceNotFoundError,
  BusinessRuleError,
  ValidationError,
} from "@/errors";
import { Proposal } from "@/generated/prisma/client";
import { ProposalStatus } from "@/generated/prisma/enums";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import { IProposalRepository } from "@/repositories/IProposalRepository";
import { ChangeProjectStatusUseCase } from "../projects/ChangeProjectStatusUseCase";
import { sendProposalToClient } from "@/email/send";
import { IS3StorageService } from "@/services/s3Client/IS3StorageService";

interface ChangeProposalStatusRequest {
  proposalId: string;
  newStatus: ProposalStatus;
  userId: string;
  communicationChannel?: "whatsapp" | "email" | "none";
  rejectFormDetails?: any;
}

export class ChangeProposalStatusUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private chageProjectStatusUseCase: ChangeProjectStatusUseCase,
    private auditLogRepository: IAuditLogRepository,
    private storageService: IS3StorageService,
  ) {}

  async execute({
    proposalId,
    newStatus,
    userId,
    communicationChannel,
    rejectFormDetails = {},
  }: ChangeProposalStatusRequest): Promise<Proposal> {
    const proposal = await this.proposalRepository.findById(proposalId);

    if (!proposal) {
      throw new ResourceNotFoundError("Proposta não encontrada.");
    }

    if (!this.isValidTransition(proposal.status, newStatus)) {
      throw new BusinessRuleError(
        `Não é possível alterar o status de ${proposal.status} para ${newStatus}.`,
        { statusCode: 400 },
      );
    }

    await checkUserPermissionForAsset(
      "proposal",
      userId,
      { proposal, organizationId: proposal.project.organizationId },
      "UPDATE",
    );

    const updatedProposal = await prisma.$transaction(async (tx) => {
      const updatedProposalEntity = await this.proposalRepository.updateStatus(
        proposalId,
        newStatus,
        userId,
        tx,
      );

      if (newStatus === "SENT" && communicationChannel === "email") {
        if (!proposal.fileKey) {
          throw new ValidationError("Arquivo da proposta não encontrado.");
        }

        const fileBuffer = await this.storageService.getFileBuffer(
          proposal.fileKey,
        );

        await sendProposalToClient({
          to: proposal.project.client.email,
          clientName: proposal.project.client.tradeName,
          projectName: proposal.project.name,
          totalValue: proposal.totalValue.toString(),
          validUntil: proposal.validUntil?.toLocaleDateString() ?? "",
          attachments: [
            {
              filename: `Proposta - ${proposal.project.name}.pdf`,
              content: fileBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      }

      if (newStatus === "ACCEPTED") {
        await this.chageProjectStatusUseCase.execute(
          {
            projectId: updatedProposalEntity.projectId,
            newStatus: "PROPOSAL_GENERATED",
            data: { observation: "Proposta aceita pelo cliente." },
            userId: userId,
          },
          tx,
        );
      }

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: updatedProposalEntity.projectId ?? "",
          action: "PROPOSAL_STATUS_CHANGE",
          userId,
          changes: {
            status: { from: proposal.status, to: updatedProposalEntity.status },
          },
          metadata: {
            proposalId: updatedProposalEntity.id,
            ...rejectFormDetails,
          },
        },
        tx,
      );
      return updatedProposalEntity;
    });

    return updatedProposal;
  }

  // Helper para validar a transição (State Machine Guard)
  private isValidTransition(
    current: ProposalStatus,
    next: ProposalStatus,
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
