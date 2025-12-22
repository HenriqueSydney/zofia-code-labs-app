import { prisma } from "@/lib/prisma";
import {
  CreateContractDTO,
  CreateContractItemDTO,
  IContractRepository,
  ContractWithDetails,
  UpdateContractDTO,
} from "../IContractRepository";
import { Prisma, Contract, ContractStatus } from "@/generated/prisma/client";
import { normalizePrisma } from "@/utils/normalizePrisma";

export class PrismaContractRepository implements IContractRepository {
  async create(
    data: CreateContractDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Contract> {
    if (tx) {
      return this.executeCreateLogic(data, tx);
    }

    return await prisma.$transaction((newTx) => {
      return this.executeCreateLogic(data, newTx);
    });
  }

  private async executeCreateLogic(
    data: CreateContractDTO,
    tx: Prisma.TransactionClient
  ): Promise<Contract> {
    // 1. Buscar a última versão para este projeto
    const lastContract = await tx.contract.findFirst({
      where: { projectId: data.projectId },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (lastContract?.version ?? 0) + 1;

    // 2. Marcar versões anteriores como não atuais (opcional, se usar isCurrent)
    await tx.contract.updateMany({
      where: { projectId: data.projectId, isCurrent: true },
      data: { isCurrent: false, status: "CANCELLED" },
    });

    // 3. Criar a nova versão (Snapshot)
    const contract = await tx.contract.create({
      data: {
        projectId: data.projectId,
        createdBy: data.createdBy,
        status: "DRAFT",
        version: nextVersion,
        isCurrent: true,
        proposalId: data.proposalId,
      },
    });

    return normalizePrisma(contract);
  }

  async findById(id: string): Promise<ContractWithDetails | null> {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        contractTemplate: {
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

    return normalizePrisma(contract);
  }

  async getHistory(projectId: string): Promise<ContractWithDetails[]> {
    const history = await prisma.contract.findMany({
      where: { projectId },
      include: {
        project: {
          select: { client: { select: { tradeName: true, email: true } } }, // Otimização: trazer só o necessário
        },
        contractTemplate: {
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

  async findAllByClient(clientId: string): Promise<Contract[]> {
    const contracts = await prisma.contract.findMany({
      where: { project: { clientId }, isCurrent: true },
      orderBy: { version: "desc" },
    });

    const plain = contracts.map(normalizePrisma);

    return plain as any;
  }

  async update(
    id: string,
    data: UpdateContractDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Contract> {
    const client = tx || prisma;

    return await client.contract.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async updateStatus(
    id: string,
    status: ContractStatus,
    tx?: Prisma.TransactionClient
  ): Promise<Contract> {
    const client = tx || prisma;
    return await client.contract.update({
      where: { id },
      data: { status },
    });
  }

  async cancel(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.contract.update({
      data: {
        status: "CANCELLED",
      },
      where: { id },
    });
  }
}
