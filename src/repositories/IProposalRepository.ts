// dtos/proposal.dto.ts
import { Prisma, Proposal, ProposalItem } from "@/generated/prisma/client";
import {
  DiscountType,
  ProposalSource,
  ProposalStatus,
} from "@/generated/prisma/enums";

export interface CreateProposalItemDTO {
  serviceTypeId: string;
  price: number;
  discount: number;
  discountType: DiscountType;
  finalPrice: number;
}

export interface CreateProposalDTO {
  projectId: string;
  status?: ProposalStatus;
  sourceType: ProposalSource;
  templateId?: string | null;
  fileStorageKey?: string | null;
  createdBy: string;
  validUntil?: Date;
  totalValue: number;
  items: CreateProposalItemDTO[];
  paymentGatewayId?: string;
  paymentMethod?: string;
}

export interface UpdateProposalDTO
  extends Partial<Omit<CreateProposalDTO, "items">> {
  status?: ProposalStatus;
  projectId?: string;
}

// Tipo de retorno completo (com relações)
export type ProposalWithDetails = Proposal & {
  items: (ProposalItem & { serviceType: { name: string } })[];
  proposalTemplate: {
    id: string;
    content: unknown;
  } | null;
  project: {
    name: string;
    slug: string;
    organizationId: string;
    client: { tradeName: string; email: string; slug: string };
  };
  createdUser: { name: string | null } | null;
  approvedUser: { name: string | null } | null;
  reviewUser: { name: string | null } | null;
};

export type ProposalCreateReturnWithDetails = Proposal & {
  project: {
    slug: string;
    organizationId: string;
    client: { tradeName: string; email: string; slug: string };
  };
};

export interface IProposalRepository {
  create(
    data: CreateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<ProposalCreateReturnWithDetails>;
  findById(id: string): Promise<ProposalWithDetails | null>;
  findAllByClient(clientId: string): Promise<Proposal[]>;
  getHistory(projectId: string): Promise<ProposalWithDetails[]>;
  update(
    id: string,
    data: UpdateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal>;
  updateStatus(
    id: string,
    status: ProposalStatus,
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal>;
  cancel(id: string, tx?: Prisma.TransactionClient): Promise<void>;
  findLastAcceptedProposal(projectId: string): Promise<Proposal | null>;

  replaceItems(
    proposalId: string,
    newItems: CreateProposalItemDTO[],
    newTotal: number,
    tx?: Prisma.TransactionClient
  ): Promise<void>;
}
