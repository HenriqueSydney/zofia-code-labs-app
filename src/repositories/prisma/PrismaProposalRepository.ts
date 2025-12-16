import { prisma } from "@/lib/prisma";
import {
  CreateProposalDTO,
  CreateProposalItemDTO,
  IProposalRepository,
  ProposalWithDetails,
  UpdateProposalDTO,
} from "../IProposalRepository";
import { Prisma, Proposal, ProposalStatus } from "@/generated/prisma/client";

export class PrismaProposalRepository implements IProposalRepository {
  async create(
    data: CreateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal> {
    const client = tx || prisma;
    return await client.proposal.create({
      data: {
        clientId: data.clientId,
        createdBy: data.createdBy,
        validUntil: data.validUntil,
        totalValue: data.totalValue, // Prisma converte number para Decimal automaticamente
        status: "DRAFT",
        items: {
          create: data.items.map((item) => ({
            serviceTypeId: item.serviceTypeId,
            description: item.description,
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
  }

  async findById(id: string): Promise<ProposalWithDetails | null> {
    return (await prisma.proposal.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            serviceType: { select: { name: true } }, // Trazendo info extra do tipo de serviço
          },
        },
        client: {
          select: { tradeName: true, email: true }, // Otimização: trazer só o necessário
        },
        user: {
          select: { name: true },
        },
      },
    })) as ProposalWithDetails | null;
  }

  async findAllByClient(clientId: string): Promise<Proposal[]> {
    return await prisma.proposal.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllByProjectId(projectId: string): Promise<Proposal[]> {
    return await prisma.proposal.findMany({
      where: { generatedProjectId: projectId },
      orderBy: { createdAt: "desc" },
    });
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
                description: item.description,
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
              description: item.description,
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

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.proposal.update({
      data: {
        status: "REJECTED",
      },
      where: { id },
    });
  }
}
