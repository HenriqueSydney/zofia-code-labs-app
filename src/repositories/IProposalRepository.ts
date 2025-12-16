// dtos/proposal.dto.ts
import { Prisma, Proposal, ProposalItem } from "@/generated/prisma/client";
import { DiscountType, ProposalStatus } from "@/generated/prisma/enums";

export interface CreateProposalItemDTO {
  serviceTypeId: string;
  description?: string;
  price: number;
  discount: number;
  discountType: DiscountType;
  finalPrice: number;
}

export interface CreateProposalDTO {
  generatedProjectId: string;
  templateId?: string | null;
  fileUrl?: string | null;
  clientId: string;
  createdBy: string;
  validUntil?: Date;
  totalValue: number;
  items: CreateProposalItemDTO[];
}

export interface UpdateProposalDTO
  extends Partial<Omit<CreateProposalDTO, "items">> {
  status?: ProposalStatus;
  generatedProjectId?: string;
}

// Tipo de retorno completo (com relações)
export type ProposalWithDetails = Proposal & {
  items: (ProposalItem & { serviceType: { name: string } })[];
  client: { tradeName: string; email: string };
  user: { name: string };
};

export interface IProposalRepository {
  create(
    data: CreateProposalDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Proposal>;
  findById(id: string): Promise<ProposalWithDetails | null>;
  findAllByClient(clientId: string): Promise<Proposal[]>;
  findAllByProjectId(projectId: string): Promise<Proposal[]>;
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
