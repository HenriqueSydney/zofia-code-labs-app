import { Prisma, ProposalTemplate } from "@/generated/prisma/client";

export type TemplateContent = Record<string, unknown> | unknown[];

export interface CreateProposalTemplateDTO {
  proposalId: string;
  content?: TemplateContent | null;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateProposalTemplateDTO
  extends Partial<CreateProposalTemplateDTO> {}

export type ProposalTemplateWithDetails = ProposalTemplate;

export interface IProposalTemplateRepository {
  create(
    data: CreateProposalTemplateDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<ProposalTemplate>;
  update(
    id: string,
    data: UpdateProposalTemplateDTO,
  ): Promise<ProposalTemplate>;
  findById(id: string): Promise<ProposalTemplateWithDetails | null>;
  findAllActive(): Promise<ProposalTemplateWithDetails[]>;
  findDefault(): Promise<ProposalTemplateWithDetails | null>;
  delete(id: string): Promise<void>;
}
