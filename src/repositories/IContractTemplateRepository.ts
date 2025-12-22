import { Prisma, ContractTemplate } from "@/generated/prisma/client";

export type TemplateContent = Record<string, any> | Array<any>;

export interface CreateContractTemplateDTO {
  contractId: string;
  documentTemplateId: string;
  content: TemplateContent; // Agora é JSON, não string
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateContractTemplateDTO
  extends Partial<CreateContractTemplateDTO> {}

// Tipo de retorno enriquecido (incluindo o nome do DocumentTemplate)
export type ContractTemplateWithDetails = ContractTemplate & {
  template: {
    // O relacionamento com DocumentTemplate
    id: string;
    title: string; // Assumindo que DocumentTemplate tem 'name' ou 'title'
    description?: string | null;
  };
};

export interface IContractTemplateRepository {
  create(
    data: CreateContractTemplateDTO,
    tx?: Prisma.TransactionClient
  ): Promise<ContractTemplate>;
  update(
    id: string,
    data: UpdateContractTemplateDTO
  ): Promise<ContractTemplate>;
  findById(id: string): Promise<ContractTemplateWithDetails | null>;
  findAllActive(): Promise<ContractTemplateWithDetails[]>;
  findDefault(): Promise<ContractTemplateWithDetails | null>;
  delete(id: string): Promise<void>;
}
