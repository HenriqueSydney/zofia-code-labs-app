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
    tx?: Prisma.TransactionClient
  ): Promise<ContractTemplate> {
    const client = tx || prisma;
    const { isDefault, documentTemplateId, contractId, ...rest } = data;

    // Criação simples se não for default
    return await client.contractTemplate.create({
      data: {
        ...rest,
        isDefault: false,
        content: data.content as Prisma.InputJsonValue,
        template: { connect: { id: documentTemplateId } },
        contract: {
          connect: { id: contractId },
        },
      },
    });
  }

  async update(
    id: string,
    data: UpdateContractTemplateDTO
  ): Promise<ContractTemplate> {
    const { isDefault, ...rest } = data;

    if (isDefault === true) {
      return await prisma.$transaction(async (tx) => {
        // Remove default dos outros (exceto o atual, logicamente)
        await tx.contractTemplate.updateMany({
          where: { id: { not: id }, isDefault: true },
          data: { isDefault: false },
        });

        return await tx.contractTemplate.update({
          where: { id },
          data: {
            ...rest,
            isDefault: true,
            content: data.content as Prisma.InputJsonValue | undefined,
          },
        });
      });
    }

    return await prisma.contractTemplate.update({
      where: { id },
      data: {
        ...rest,
        isDefault: isDefault, // Pode ser undefined ou false aqui
        content: data.content as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findById(id: string): Promise<ContractTemplateWithDetails | null> {
    return await prisma.contractTemplate.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  async findAllActive(): Promise<ContractTemplateWithDetails[]> {
    return await prisma.contractTemplate.findMany({
      where: { isActive: true },
      include: {
        template: true, // Importante para mostrar o nome na listagem
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDefault(): Promise<ContractTemplateWithDetails | null> {
    return await prisma.contractTemplate.findFirst({
      where: { isDefault: true, isActive: true },
      include: {
        template: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.contractTemplate.delete({
      where: { id },
    });
  }
}
