// dtos/proposal.dto.ts
import {
  DocumentTemplate,
  Prisma,
  Proposal,
  ProposalItem,
} from "@/generated/prisma/client";
import { DiscountType, ProposalStatus } from "@/generated/prisma/enums";

export interface CreateProposalItemDTO {
  serviceTypeId: string;
  price: number;
  discount: number;
  discountType: DiscountType;
  finalPrice: number;
}

export interface CreateProposalDTO {
  projectId: string;
  templateId?: string | null;
  fileUrl?: string | null;
  createdBy: string;
  validUntil?: Date;
  totalValue: number;
  items: CreateProposalItemDTO[];
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
    template: { title: string | null } | null;
  } | null;
  project: {
    organizationId: string;
    client: { tradeName: string; email: string };
  };
  createdUser: { name: string | null } | null;
  approvedUser: { name: string | null } | null;
  reviewUser: { name: string | null } | null;
};

export interface IProposalRepository {
  create(
    data: CreateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal>;
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
    tx?: Prisma.TransactionClient
  ): Promise<Proposal>;
  delete(id: string, tx?: Prisma.TransactionClient): Promise<void>;

  replaceItems(
    proposalId: string,
    newItems: CreateProposalItemDTO[],
    newTotal: number,
    tx?: Prisma.TransactionClient
  ): Promise<void>;
}
