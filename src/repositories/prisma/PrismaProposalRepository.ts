import { prisma } from "@/lib/prisma";
import {
  CreateProposalDTO,
  CreateProposalItemDTO,
  IProposalRepository,
  ProposalWithDetails,
  UpdateProposalDTO,
} from "../IProposalRepository";
import { Prisma, Proposal, ProposalStatus } from "@/generated/prisma/client";
import { normalizePrisma } from "@/utils/normalizePrisma";

export class PrismaProposalRepository implements IProposalRepository {
  async create(
    data: CreateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal> {
    if (tx) {
      return this.executeCreateLogic(data, tx);
    }

    return await prisma.$transaction((newTx) => {
      return this.executeCreateLogic(data, newTx);
    });
  }

  private async executeCreateLogic(
    data: CreateProposalDTO,
    tx: Prisma.TransactionClient
  ): Promise<Proposal> {
    // 1. Buscar a última versão para este projeto
    const lastProposal = await tx.proposal.findFirst({
      where: { projectId: data.projectId },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (lastProposal?.version ?? 0) + 1;

    // 2. Marcar versões anteriores como não atuais (opcional, se usar isCurrent)
    await tx.proposal.updateMany({
      where: { projectId: data.projectId, isCurrent: true },
      data: { isCurrent: false, status: "REJECTED" },
    });

    // 3. Criar a nova versão (Snapshot)
    const proposal = await tx.proposal.create({
      data: {
        projectId: data.projectId,
        createdBy: data.createdBy,
        validUntil: data.validUntil,
        totalValue: data.totalValue,
        fileKey: data.fileStorageKey,
        sourceType: data.sourceType,
        status: data.status ?? "DRAFT",
        version: nextVersion,
        isCurrent: true,
        items: {
          create: data.items.map((item) => ({
            serviceTypeId: item.serviceTypeId,
            price: item.price,
            discount: item.discount,
            discountType: item.discountType,
            finalPrice: item.finalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return normalizePrisma(proposal);
  }

  async findById(id: string): Promise<ProposalWithDetails | null> {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            serviceType: { select: { name: true } }, // Trazendo info extra do tipo de serviço
          },
        },
        proposalTemplate: {
          include: { template: { select: { title: true } } },
        },
        project: {
          select: {
            organizationId: true,
            client: { select: { tradeName: true, email: true } },
          }, // Otimização: trazer só o necessário
        },
        createdUser: {
          select: { name: true },
        },
        approvedUser: {
          select: { name: true },
        },
        reviewUser: {
          select: { name: true },
        },
      },
    });

    return normalizePrisma(proposal);
  }

  async getHistory(projectId: string): Promise<ProposalWithDetails[]> {
    const history = await prisma.proposal.findMany({
      where: { projectId },
      include: {
        items: {
          include: {
            serviceType: { select: { name: true } }, // Trazendo info extra do tipo de serviço
          },
        },
        project: {
          select: { client: { select: { tradeName: true, email: true } } }, // Otimização: trazer só o necessário
        },
        proposalTemplate: {
          include: { template: { select: { title: true } } },
        },
        createdUser: {
          select: { name: true },
        },
        approvedUser: {
          select: { name: true },
        },
        reviewUser: {
          select: { name: true },
        },
      },
      orderBy: { version: "desc" },
    });

    const plain = history.map(normalizePrisma);

    return plain as any;
  }

  async findAllByClient(clientId: string): Promise<Proposal[]> {
    const proposals = await prisma.proposal.findMany({
      where: { project: { clientId }, isCurrent: true },
      orderBy: { version: "desc" },
    });

    const plain = proposals.map(normalizePrisma);

    return plain as any;
  }

  async findLastAcceptedProposal(projectId: string): Promise<Proposal | null> {
    const proposal = await prisma.proposal.findFirst({
      where: {
        projectId,
        status: "ACCEPTED",
      },
      orderBy: {
        approvedAt: "desc",
      },
    });

    return normalizePrisma(proposal);
  }

  async update(
    id: string,
    data: UpdateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal> {
    const client = tx || prisma;

    return await client.proposal.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async updateStatus(
    id: string,
    status: ProposalStatus,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal> {
    const client = tx || prisma;
    return await client.proposal.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Substitui todos os itens de uma proposta (Transação).
   * Útil quando o usuário edita a proposta inteira no frontend e salva.
   */
  async replaceItems(
    proposalId: string,
    newItems: CreateProposalItemDTO[],
    newTotal: number,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    if (tx) {
      await tx.proposalItem.deleteMany({
        where: { proposalId },
      }),
        prisma.proposal.update({
          where: { id: proposalId },
          data: {
            totalValue: newTotal,
            items: {
              create: newItems.map((item) => ({
                serviceTypeId: item.serviceTypeId,
                price: item.price,
                discount: item.discount,
                discountType: item.discountType,
                finalPrice: item.finalPrice,
              })),
            },
          },
        });

      return;
    }

    await prisma.$transaction([
      prisma.proposalItem.deleteMany({
        where: { proposalId },
      }),

      prisma.proposal.update({
        where: { id: proposalId },
        data: {
          totalValue: newTotal,
          items: {
            create: newItems.map((item) => ({
              serviceTypeId: item.serviceTypeId,
              price: item.price,
              discount: item.discount,
              discountType: item.discountType,
              finalPrice: item.finalPrice,
            })),
          },
        },
      }),
    ]);
  }

  async cancel(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.proposal.update({
      data: {
        isCurrent: false,
        status: "CANCELLED",
      },
      where: { id },
    });
  }

  async reject(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.proposal.update({
      data: {
        status: "REJECTED",
      },
      where: { id },
    });
  }
}
