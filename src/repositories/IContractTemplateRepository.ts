import { Prisma, ContractTemplate } from "@/generated/prisma/client";

export type TemplateContent = Record<string, unknown> | unknown[];

export interface CreateContractTemplateDTO {
  contractId: string;
  content?: TemplateContent | null;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateContractTemplateDTO
  extends Partial<CreateContractTemplateDTO> {}

export type ContractTemplateWithDetails = ContractTemplate;

export interface IContractTemplateRepository {
  create(
    data: CreateContractTemplateDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<ContractTemplate>;
  update(
    id: string,
    data: UpdateContractTemplateDTO,
  ): Promise<ContractTemplate>;
  findById(id: string): Promise<ContractTemplateWithDetails | null>;
  findAllActive(): Promise<ContractTemplateWithDetails[]>;
  findDefault(): Promise<ContractTemplateWithDetails | null>;
  delete(id: string): Promise<void>;
}
