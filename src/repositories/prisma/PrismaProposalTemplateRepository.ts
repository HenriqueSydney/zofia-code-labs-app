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
    tx?: Prisma.TransactionClient,
  ): Promise<ProposalTemplate> {
    const client = tx || prisma;
    const { isDefault, proposalId, content, ...rest } = data;

    return await client.proposalTemplate.create({
      data: {
        ...rest,
        isDefault: isDefault ?? false,
        content:
          content === undefined
            ? undefined
            : (content as Prisma.InputJsonValue),
        proposal: {
          connect: { id: proposalId },
        },
      },
    });
  }

  async update(
    id: string,
    data: UpdateProposalTemplateDTO,
  ): Promise<ProposalTemplate> {
    const { isDefault, content, ...rest } = data;

    if (isDefault === true) {
      return await prisma.$transaction(async (tx) => {
        await tx.proposalTemplate.updateMany({
          where: { id: { not: id }, isDefault: true },
          data: { isDefault: false },
        });

        return await tx.proposalTemplate.update({
          where: { id },
          data: {
            ...rest,
            isDefault: true,
            content:
              content === undefined
                ? undefined
                : (content as Prisma.InputJsonValue),
          },
        });
      });
    }

    return await prisma.proposalTemplate.update({
      where: { id },
      data: {
        ...rest,
        isDefault,
        content:
          content === undefined ? undefined : (content as Prisma.InputJsonValue),
      },
    });
  }

  async findById(id: string): Promise<ProposalTemplateWithDetails | null> {
    return await prisma.proposalTemplate.findUnique({
      where: { id },
    });
  }

  async findAllActive(): Promise<ProposalTemplateWithDetails[]> {
    return await prisma.proposalTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDefault(): Promise<ProposalTemplateWithDetails | null> {
    return await prisma.proposalTemplate.findFirst({
      where: { isDefault: true, isActive: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.proposalTemplate.delete({
      where: { id },
    });
  }
}
