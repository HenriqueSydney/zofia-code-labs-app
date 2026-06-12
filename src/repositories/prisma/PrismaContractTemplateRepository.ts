import { prisma } from "@/lib/prisma";
import {
  CreateContractTemplateDTO,
  UpdateContractTemplateDTO,
  ContractTemplateWithDetails,
  IContractTemplateRepository,
} from "../IContractTemplateRepository";
import { Prisma, ContractTemplate } from "@/generated/prisma/client";

export class PrismaContractTemplateRepository
  implements IContractTemplateRepository
{
  async create(
    data: CreateContractTemplateDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<ContractTemplate> {
    const client = tx || prisma;
    const { isDefault, contractId, content, ...rest } = data;

    return await client.contractTemplate.create({
      data: {
        ...rest,
        isDefault: isDefault ?? false,
        content:
          content === undefined
            ? undefined
            : (content as Prisma.InputJsonValue),
        contract: {
          connect: { id: contractId },
        },
      },
    });
  }

  async update(
    id: string,
    data: UpdateContractTemplateDTO,
  ): Promise<ContractTemplate> {
    const { isDefault, content, ...rest } = data;

    if (isDefault === true) {
      return await prisma.$transaction(async (tx) => {
        await tx.contractTemplate.updateMany({
          where: { id: { not: id }, isDefault: true },
          data: { isDefault: false },
        });

        return await tx.contractTemplate.update({
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

    return await prisma.contractTemplate.update({
      where: { id },
      data: {
        ...rest,
        isDefault,
        content:
          content === undefined ? undefined : (content as Prisma.InputJsonValue),
      },
    });
  }

  async findById(id: string): Promise<ContractTemplateWithDetails | null> {
    return await prisma.contractTemplate.findUnique({
      where: { id },
    });
  }

  async findAllActive(): Promise<ContractTemplateWithDetails[]> {
    return await prisma.contractTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDefault(): Promise<ContractTemplateWithDetails | null> {
    return await prisma.contractTemplate.findFirst({
      where: { isDefault: true, isActive: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.contractTemplate.delete({
      where: { id },
    });
  }
}
