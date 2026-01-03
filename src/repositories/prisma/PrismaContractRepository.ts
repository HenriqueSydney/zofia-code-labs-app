import { prisma } from "@/lib/prisma";
import {
  CreateContractDTO,
  IContractRepository,
  ContractWithDetails,
  UpdateContractDTO,
  ListContractParams,
} from "../IContractRepository";
import { Prisma, Contract, ContractStatus } from "@/generated/prisma/client";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { Pagination } from "@/@types/Pagination";
import { getPaginationQuery } from "@/utils/getPaginationQuery";

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
        fileKey: data.fileStorageKey,
        sourceType: data.sourceType,
        status: data.status ?? "DRAFT",
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
            name: true,
            organizationId: true,
            client: { select: { tradeName: true, email: true } },
          }, // Otimização: trazer só o necessário
        },
        proposal: {
          select: { totalValue: true },
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

  async list(
    { organizationId, query }: ListContractParams,
    pagination: Pagination
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }> {
    const where: Prisma.ContractWhereInput = query
      ? {
          OR: [
            {
              project: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            {
              project: {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            {
              project: {
                client: {
                  companyName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              project: {
                client: {
                  tradeName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
          project: { organizationId },
        }
      : { project: { organizationId } };

    const paginationDef = getPaginationQuery(pagination);

    const [totalOfRegister, contracts] = await Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        include: {
          contractTemplate: {
            include: { template: { select: { title: true } } },
          },
          project: {
            select: {
              name: true,
              organizationId: true,
              client: { select: { tradeName: true, email: true } },
            },
          },
          proposal: {
            select: { totalValue: true },
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
        ...paginationDef,
        where,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const plain = contracts.map(normalizePrisma);

    return { totalOfRegister, contracts: plain as any };
  }

  async getHistory(
    projectId: string,
    pagination: Pagination
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }> {
    const paginationDef = getPaginationQuery(pagination);
    const [totalOfRegister, contracts] = await Promise.all([
      prisma.contract.count({ where: { projectId } }),
      prisma.contract.findMany({
        where: { projectId },
        include: {
          project: {
            select: {
              name: true,
              organizationId: true,
              client: { select: { tradeName: true, email: true } },
            }, // Otimização: trazer só o necessário
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
        ...paginationDef,
        orderBy: { version: "desc" },
      }),
    ]);

    const plain = contracts.map(normalizePrisma);

    return { totalOfRegister, contracts: plain as any };
  }

  async findAllByClient(
    clientId: string,
    pagination: Pagination
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }> {
    const paginationDef = getPaginationQuery(pagination);
    const [totalOfRegister, contracts] = await Promise.all([
      prisma.contract.count({
        where: { project: { clientId }, isCurrent: true },
      }),
      prisma.contract.findMany({
        where: { project: { clientId }, isCurrent: true },
        include: {
          project: {
            select: {
              name: true,
              organizationId: true,
              client: { select: { tradeName: true, email: true } },
            },
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
        ...paginationDef,
        orderBy: { version: "desc" },
      }),
    ]);

    const plain = contracts.map(normalizePrisma);

    return { totalOfRegister, contracts: plain as any };
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
