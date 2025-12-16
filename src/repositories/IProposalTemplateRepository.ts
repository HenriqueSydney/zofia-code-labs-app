import { Prisma, ProposalTemplate } from "@/generated/prisma/client";

export type TemplateContent = Record<string, any> | Array<any>;

export interface CreateProposalTemplateDTO {
  documentTemplateId: string;
  content: TemplateContent; // Agora é JSON, não string
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateProposalTemplateDTO
  extends Partial<CreateProposalTemplateDTO> {}

// Tipo de retorno enriquecido (incluindo o nome do DocumentTemplate)
export type ProposalTemplateWithDetails = ProposalTemplate & {
  template: {
    // O relacionamento com DocumentTemplate
    id: string;
    title: string; // Assumindo que DocumentTemplate tem 'name' ou 'title'
    description?: string | null;
  };
};

export interface IProposalTemplateRepository {
  create(
    data: CreateProposalTemplateDTO,
    tx?: Prisma.TransactionClient
  ): Promise<ProposalTemplate>;
  update(
    id: string,
    data: UpdateProposalTemplateDTO
  ): Promise<ProposalTemplate>;
  findById(id: string): Promise<ProposalTemplateWithDetails | null>;
  findAllActive(): Promise<ProposalTemplateWithDetails[]>;
  findDefault(): Promise<ProposalTemplateWithDetails | null>;
  delete(id: string): Promise<void>;
}
