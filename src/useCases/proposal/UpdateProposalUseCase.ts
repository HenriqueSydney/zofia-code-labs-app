import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { prisma } from "@/lib/prisma";
import { IAuditLogRepository } from "@/repositories/IAuditLogRepository";
import {
  CreateProposalItemDTO,
  IProposalRepository,
  UpdateProposalDTO,
} from "@/repositories/IProposalRepository";
import {
  calculateItemFinalPrice,
  calculateProposalTotal,
} from "@/utils/calculateItemFinalPrice";

interface UpdateProposalInput extends UpdateProposalDTO {
  items?: CreateProposalItemDTO[];
  userId: string;
  organizationId: string;
}

export class UpdateProposalUseCase {
  constructor(
    private proposalRepository: IProposalRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async execute(id: string, data: UpdateProposalInput) {
    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) throw new Error("Proposal not found");

    await checkUserPermissionForAsset(
      "proposal",
      data.userId,
      proposal,
      "UPDATE"
    );

    if (data.items && data.items.length > 0) {
      const processedItems = data.items.map((item) => ({
        ...item,
        finalPrice: calculateItemFinalPrice(item),
      }));

      const newTotal = calculateProposalTotal(processedItems);

      const { items, ...headerData } = data;

      const result = await prisma.$transaction(async (tx) => {
        await this.proposalRepository.update(
          id,
          {
            ...headerData,
            totalValue: newTotal,
          },
          tx
        );

        await this.proposalRepository.replaceItems(
          id,
          processedItems,
          newTotal,
          tx
        );

        await this.auditLogRepository.create(
          {
            entityType: "Project",
            entityId: proposal.generatedProjectId ?? "",
            action: "PROPOSAL_UPDATED",
            userId: data.userId,
            changes: {
              status: {
                from: proposal.status,
                to: headerData.status ?? proposal.status,
              },
            },
            metadata: {
              proposalId: proposal.id,
            },
          },
          tx
        );

        return await this.proposalRepository.findById(id);
      });

      return result;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProposal = await this.proposalRepository.update(
        id,
        data,
        tx
      );

      await this.auditLogRepository.create(
        {
          entityType: "Project",
          entityId: proposal.generatedProjectId ?? "",
          action: "PROPOSAL_UPDATED",
          userId: data.userId,
          changes: {
            status: {
              from: proposal.status,
              to: data.status ?? proposal.status,
            },
          },
          metadata: {
            proposalId: proposal.id,
          },
        },
        tx
      );

      return updatedProposal;
    });
    return result;
  }
}
