import { prisma } from "@/lib/prisma";
import {
  CreateProposalTemplateDTO,
  UpdateProposalTemplateDTO,
  ProposalTemplateWithDetails,
  IProposalTemplateRepository,
} from "../IProposalTemplateRepository";
import { Prisma, ProposalTemplate } from "@/generated/prisma/client";

export class PrismaProposalTemplateRepository
  implements IProposalTemplateRepository
{
  async create(
    data: CreateProposalTemplateDTO,
    tx?: Prisma.TransactionClient
  ): Promise<ProposalTemplate> {
    const client = tx || prisma;
    const { isDefault, ...rest } = data;

    // Criação simples se não for default
    return await client.proposalTemplate.create({
      data: {
        ...rest,
        isDefault: false,
        content: data.content as Prisma.InputJsonValue,
      },
    });
  }

  async update(
    id: string,
    data: UpdateProposalTemplateDTO
  ): Promise<ProposalTemplate> {
    const { isDefault, ...rest } = data;

    if (isDefault === true) {
      return await prisma.$transaction(async (tx) => {
        // Remove default dos outros (exceto o atual, logicamente)
        await tx.proposalTemplate.updateMany({
          where: { id: { not: id }, isDefault: true },
          data: { isDefault: false },
        });

        return await tx.proposalTemplate.update({
          where: { id },
          data: {
            ...rest,
            isDefault: true,
            content: data.content as Prisma.InputJsonValue | undefined,
          },
        });
      });
    }

    return await prisma.proposalTemplate.update({
      where: { id },
      data: {
        ...rest,
        isDefault: isDefault, // Pode ser undefined ou false aqui
        content: data.content as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findById(id: string): Promise<ProposalTemplateWithDetails | null> {
    return await prisma.proposalTemplate.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  async findAllActive(): Promise<ProposalTemplateWithDetails[]> {
    return await prisma.proposalTemplate.findMany({
      where: { isActive: true },
      include: {
        template: true, // Importante para mostrar o nome na listagem
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDefault(): Promise<ProposalTemplateWithDetails | null> {
    return await prisma.proposalTemplate.findFirst({
      where: { isDefault: true, isActive: true },
      include: {
        template: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.proposalTemplate.delete({
      where: { id },
    });
  }
}
