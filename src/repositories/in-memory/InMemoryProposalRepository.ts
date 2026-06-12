import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import {
  Prisma,
  Proposal,
  ProposalItem,
  ProposalStatus,
} from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import {
  CreateProposalDTO,
  CreateProposalItemDTO,
  IProposalRepository,
  ProposalCreateReturnWithDetails,
  ProposalWithDetails,
  UpdateProposalDTO,
} from "../IProposalRepository";

type ProposalProjectRef = {
  id: string;
  name?: string;
  slug: string;
  organizationId: string;
  clientId: string;
};

type ProposalClientRef = {
  id: string;
  tradeName: string;
  email: string;
  slug: string;
};

type ProposalUserRef = {
  id: string;
  name: string | null;
};

type ProposalServiceTypeRef = {
  id: string;
  name: string;
};

export class InMemoryProposalRepository implements IProposalRepository {
  public items: Proposal[] = [];
  public proposalItems: ProposalItem[] = [];
  public projects: ProposalProjectRef[] = [];
  public clients: ProposalClientRef[] = [];
  public users: ProposalUserRef[] = [];
  public serviceTypes: ProposalServiceTypeRef[] = [];

  async create(
    data: CreateProposalDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ProposalCreateReturnWithDetails> {
    const now = date().toDate();
    const lastProposal = this.items
      .filter((item) => item.projectId === data.projectId)
      .sort((a, b) => b.version - a.version)[0];
    const nextVersion = (lastProposal?.version ?? 0) + 1;

    for (const proposal of this.items) {
      if (proposal.projectId === data.projectId && proposal.isCurrent) {
        proposal.isCurrent = false;
        proposal.status = "REJECTED";
        proposal.updatedAt = now;
      }
    }

    const proposal: Proposal = {
      id: randomUUID(),
      version: nextVersion,
      isCurrent: true,
      isActive: true,
      status: data.status ?? "DRAFT",
      totalValue: new Decimal(data.totalValue),
      validUntil: data.validUntil ?? null,
      createdBy: data.createdBy,
      sourceType: data.sourceType,
      downPaymentPercentage: 30,
      fileKey: data.fileStorageKey ?? null,
      fileUrl: null,
      projectId: data.projectId,
      reviewedAt: null,
      reviewedBy: null,
      approvedAt: null,
      approvedBy: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(proposal);

    for (const item of data.items) {
      this.proposalItems.push(this.buildProposalItem(proposal.id, item));
    }

    return this.toCreateReturn(proposal);
  }

  async findById(id: string): Promise<ProposalWithDetails | null> {
    const proposal = this.items.find((item) => item.id === id);
    if (!proposal) return null;
    return this.toDetails(proposal);
  }

  async findAllByClient(clientId: string): Promise<Proposal[]> {
    const projectIds = this.projects
      .filter((project) => project.clientId === clientId)
      .map((project) => project.id);

    return this.items
      .filter(
        (proposal) =>
          projectIds.includes(proposal.projectId) && proposal.isCurrent,
      )
      .sort((a, b) => b.version - a.version);
  }

  async getHistory(projectId: string): Promise<ProposalWithDetails[]> {
    return this.items
      .filter((proposal) => proposal.projectId === projectId)
      .sort((a, b) => b.version - a.version)
      .map((proposal) => this.toDetails(proposal));
  }

  async update(
    id: string,
    data: UpdateProposalDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<Proposal> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Proposal not found");
    }

    const current = this.items[index];
    const updated: Proposal = {
      ...current,
      projectId: data.projectId ?? current.projectId,
      status: data.status ?? current.status,
      sourceType: data.sourceType ?? current.sourceType,
      validUntil:
        data.validUntil !== undefined ? data.validUntil : current.validUntil,
      totalValue:
        data.totalValue !== undefined
          ? new Decimal(data.totalValue)
          : current.totalValue,
      fileKey:
        data.fileStorageKey !== undefined ? data.fileStorageKey : current.fileKey,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return updated;
  }

  async updateStatus(
    id: string,
    status: ProposalStatus,
    userId: string,
    _tx?: Prisma.TransactionClient,
  ): Promise<Proposal> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Proposal not found");
    }

    const current = this.items[index];
    const now = date().toDate();
    const updated: Proposal = {
      ...current,
      status,
      updatedAt: now,
      approvedBy: status === "APPROVED" ? userId : current.approvedBy,
      approvedAt: status === "APPROVED" ? now : current.approvedAt,
      reviewedBy: status === "REVIEW" ? userId : current.reviewedBy,
      reviewedAt: status === "REVIEW" ? now : current.reviewedAt,
    };

    this.items[index] = updated;
    return updated;
  }

  async cancel(id: string, _tx?: Prisma.TransactionClient): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Proposal not found");
    }

    this.items[index] = {
      ...this.items[index],
      isCurrent: false,
      status: "CANCELLED",
      updatedAt: date().toDate(),
    };
  }

  async findLastAcceptedProposal(projectId: string): Promise<Proposal | null> {
    return (
      this.items
        .filter(
          (proposal) =>
            proposal.projectId === projectId && proposal.status === "ACCEPTED",
        )
        .sort((a, b) => {
          const aTime = a.approvedAt?.getTime() ?? 0;
          const bTime = b.approvedAt?.getTime() ?? 0;
          return bTime - aTime;
        })[0] ?? null
    );
  }

  async replaceItems(
    proposalId: string,
    newItems: CreateProposalItemDTO[],
    newTotal: number,
    _tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const index = this.items.findIndex((item) => item.id === proposalId);
    if (index === -1) {
      throw new Error("Proposal not found");
    }

    this.proposalItems = this.proposalItems.filter(
      (item) => item.proposalId !== proposalId,
    );

    for (const item of newItems) {
      this.proposalItems.push(this.buildProposalItem(proposalId, item));
    }

    this.items[index] = {
      ...this.items[index],
      totalValue: new Decimal(newTotal),
      updatedAt: date().toDate(),
    };
  }

  private buildProposalItem(
    proposalId: string,
    item: CreateProposalItemDTO,
  ): ProposalItem {
    return {
      id: randomUUID(),
      proposalId,
      serviceTypeId: item.serviceTypeId,
      price: new Decimal(item.price),
      discount: new Decimal(item.discount),
      discountType: item.discountType,
      finalPrice: new Decimal(item.finalPrice),
    };
  }

  private resolveUser(userId: string | null) {
    if (!userId) return null;
    const user = this.users.find((item) => item.id === userId);
    return user ? { name: user.name } : { name: null };
  }

  private resolveClient(clientId: string): ProposalClientRef {
    return (
      this.clients.find((client) => client.id === clientId) ?? {
        id: clientId,
        tradeName: "",
        email: "",
        slug: "",
      }
    );
  }

  private toCreateReturn(proposal: Proposal): ProposalCreateReturnWithDetails {
    const project = this.projects.find((item) => item.id === proposal.projectId);
    const client = project ? this.resolveClient(project.clientId) : this.resolveClient("");

    return {
      ...proposal,
      project: {
        slug: project?.slug ?? "",
        organizationId: project?.organizationId ?? "",
        client: {
          tradeName: client.tradeName,
          email: client.email,
          slug: client.slug,
        },
      },
    };
  }

  private toDetails(proposal: Proposal): ProposalWithDetails {
    const project = this.projects.find((item) => item.id === proposal.projectId);
    const client = project ? this.resolveClient(project.clientId) : this.resolveClient("");

    const items = this.proposalItems
      .filter((item) => item.proposalId === proposal.id)
      .map((item) => ({
        ...item,
        serviceType: {
          name:
            this.serviceTypes.find(
              (serviceType) => serviceType.id === item.serviceTypeId,
            )?.name ?? "Unknown Service",
        },
      }));

    return {
      ...proposal,
      items,
      proposalTemplate: null,
      project: {
        name: project?.name ?? project?.slug ?? "",
        slug: project?.slug ?? "",
        organizationId: project?.organizationId ?? "",
        client: {
          tradeName: client.tradeName,
          email: client.email,
          slug: client.slug,
        },
      },
      createdUser: this.resolveUser(proposal.createdBy),
      approvedUser: this.resolveUser(proposal.approvedBy),
      reviewUser: this.resolveUser(proposal.reviewedBy),
    };
  }
}
