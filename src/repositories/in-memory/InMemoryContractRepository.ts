import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { Pagination } from "../../@types/Pagination";
import {
  Contract,
  ContractStatus,
  Prisma,
} from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import { getPaginationQuery } from "../../utils/getPaginationQuery";
import {
  ContractWithDetails,
  ContractWithProjectDetails,
  CreateContractDTO,
  IContractRepository,
  ListContractParams,
  UpdateContractDTO,
} from "../IContractRepository";

type ContractProjectRef = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  clientId: string;
  description?: string | null;
};

type ContractClientRef = {
  id: string;
  tradeName: string;
  companyName?: string;
  email: string;
  slug: string;
  responsibleName?: string | null;
  responsibleEmail?: string | null;
};

type ContractProposalRef = {
  id: string;
  totalValue: Decimal;
};

type ContractUserRef = {
  id: string;
  name: string | null;
};

type ContractTemplateRef = {
  id: string;
  content: unknown;
};

export class InMemoryContractRepository implements IContractRepository {
  public items: Contract[] = [];
  public projects: ContractProjectRef[] = [];
  public clients: ContractClientRef[] = [];
  public proposals: ContractProposalRef[] = [];
  public users: ContractUserRef[] = [];
  public contractTemplateByContractId: Record<string, ContractTemplateRef> =
    {};

  async create(
    data: CreateContractDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ContractWithProjectDetails> {
    const now = date().toDate();
    const lastContract = this.items
      .filter((item) => item.projectId === data.projectId)
      .sort((a, b) => b.version - a.version)[0];
    const nextVersion = (lastContract?.version ?? 0) + 1;

    for (const contract of this.items) {
      if (contract.projectId === data.projectId && contract.isCurrent) {
        contract.isCurrent = false;
        contract.status = "CANCELLED";
        contract.updatedAt = now;
      }
    }

    const contract: Contract = {
      id: randomUUID(),
      version: nextVersion,
      isCurrent: true,
      isActive: true,
      proposalId: data.proposalId,
      status: data.status ?? "DRAFT",
      createdBy: data.createdBy,
      sourceType: data.sourceType,
      fileKey: data.fileStorageKey ?? null,
      fileUrl: null,
      externalSignId: null,
      projectId: data.projectId,
      reviewedAt: null,
      reviewedBy: null,
      approvedAt: null,
      approvedBy: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(contract);
    return this.toProjectDetails(contract);
  }

  async findById(id: string): Promise<ContractWithDetails | null> {
    const contract = this.items.find((item) => item.id === id);
    if (!contract) return null;
    return this.toDetails(contract);
  }

  async findAllByClient(
    clientId: string,
    pagination: Pagination,
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }> {
    const clientProjectIds = this.projects
      .filter((project) => project.clientId === clientId)
      .map((project) => project.id);

    const filtered = this.items
      .filter(
        (contract) =>
          clientProjectIds.includes(contract.projectId) && contract.isCurrent,
      )
      .sort((a, b) => b.version - a.version);

    return this.paginateDetails(filtered, pagination);
  }

  async list(
    filter: ListContractParams,
    pagination: Pagination,
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }> {
    const orgProjectIds = this.projects
      .filter((project) => project.organizationId === filter.organizationId)
      .map((project) => project.id);

    let filtered = this.items.filter((contract) =>
      orgProjectIds.includes(contract.projectId),
    );

    if (filter.query) {
      const query = filter.query.toLowerCase();
      filtered = filtered.filter((contract) => {
        const project = this.projects.find((item) => item.id === contract.projectId);
        if (!project) return false;

        const client = this.clients.find((item) => item.id === project.clientId);
        return (
          project.name.toLowerCase().includes(query) ||
          (project.description?.toLowerCase().includes(query) ?? false) ||
          (client?.tradeName.toLowerCase().includes(query) ?? false)
        );
      });
    }

    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return this.paginateDetails(filtered, pagination);
  }

  async getHistory(
    projectId: string,
    pagination: Pagination,
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }> {
    const filtered = this.items
      .filter((contract) => contract.projectId === projectId)
      .sort((a, b) => b.version - a.version);

    return this.paginateDetails(filtered, pagination);
  }

  async update(
    id: string,
    data: UpdateContractDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ContractWithProjectDetails> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Contract not found");
    }

    const current = this.items[index];
    const updated: Contract = {
      ...current,
      proposalId: data.proposalId ?? current.proposalId,
      sourceType: data.sourceType ?? current.sourceType,
      projectId: data.projectId ?? current.projectId,
      status: data.status ?? current.status,
      fileKey:
        data.fileStorageKey !== undefined ? data.fileStorageKey : current.fileKey,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return this.toProjectDetails(updated);
  }

  async updateStatus(
    id: string,
    status: ContractStatus,
    _tx?: Prisma.TransactionClient,
  ): Promise<ContractWithProjectDetails> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Contract not found");
    }

    this.items[index] = {
      ...this.items[index],
      status,
      updatedAt: date().toDate(),
    };

    return this.toProjectDetails(this.items[index]);
  }

  async cancel(id: string, _tx?: Prisma.TransactionClient): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Contract not found");
    }

    this.items[index] = {
      ...this.items[index],
      status: "CANCELLED",
      updatedAt: date().toDate(),
    };
  }

  private paginateDetails(
    contracts: Contract[],
    pagination: Pagination,
  ): { contracts: ContractWithDetails[]; totalOfRegister: number } {
    const totalOfRegister = contracts.length;
    const paginationDef = getPaginationQuery(pagination);
    const skip = "skip" in paginationDef ? (paginationDef.skip as number) : 0;
    const take =
      "take" in paginationDef ? (paginationDef.take as number) : contracts.length;

    return {
      totalOfRegister,
      contracts: contracts
        .slice(skip, skip + take)
        .map((contract) => this.toDetails(contract)),
    };
  }

  private resolveUser(userId: string | null) {
    if (!userId) return null;
    const user = this.users.find((item) => item.id === userId);
    return user ? { name: user.name } : { name: null };
  }

  private toProjectDetails(contract: Contract): ContractWithProjectDetails {
    const project = this.projects.find((item) => item.id === contract.projectId);
    const client = project
      ? this.clients.find((item) => item.id === project.clientId)
      : undefined;

    return {
      ...contract,
      project: {
        organizationId: project?.organizationId ?? "",
        slug: project?.slug ?? "",
        client: {
          slug: client?.slug ?? "",
        },
      },
    };
  }

  private toDetails(contract: Contract): ContractWithDetails {
    const project = this.projects.find((item) => item.id === contract.projectId);
    const client = project
      ? this.clients.find((item) => item.id === project.clientId)
      : undefined;
    const proposal = this.proposals.find((item) => item.id === contract.proposalId);

    return {
      ...contract,
      contractTemplate:
        this.contractTemplateByContractId[contract.id] ?? null,
      project: {
        organizationId: project?.organizationId ?? "",
        name: project?.name ?? "",
        slug: project?.slug ?? "",
        client: {
          id: client?.id ?? "",
          tradeName: client?.tradeName ?? "",
          companyName: client?.companyName ?? "",
          email: client?.email ?? "",
          slug: client?.slug ?? "",
          responsibleName: client?.responsibleName ?? null,
          responsibleEmail: client?.responsibleEmail ?? null,
        },
      },
      proposal: {
        totalValue: proposal?.totalValue ?? new Decimal(0),
      },
      createdUser: this.resolveUser(contract.createdBy),
      approvedUser: this.resolveUser(contract.approvedBy),
      reviewUser: this.resolveUser(contract.reviewedBy),
    };
  }
}
