import { Prisma, Contract } from "@/generated/prisma/client";
import {
  DiscountType,
  ContractStatus,
  ContractSource,
} from "@/generated/prisma/enums";

export interface CreateContractItemDTO {
  serviceTypeId: string;
  price: number;
  discount: number;
  discountType: DiscountType;
  finalPrice: number;
}

export interface CreateContractDTO {
  proposalId: string;
  sourceType: ContractSource;
  projectId: string;
  templateId?: string | null;
  fileStorageKey?: string | null;
  status?: ContractStatus;
  createdBy: string;
}

export interface UpdateContractDTO extends Partial<CreateContractDTO> {
  status?: ContractStatus;
  projectId?: string;
}

// Tipo de retorno completo (com relações)
export type ContractWithDetails = Contract & {
  contractTemplate: {
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

export interface IContractRepository {
  create(
    data: CreateContractDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Contract>;
  findById(id: string): Promise<ContractWithDetails | null>;
  findAllByClient(clientId: string): Promise<Contract[]>;
  getHistory(projectId: string): Promise<ContractWithDetails[]>;
  update(
    id: string,
    data: UpdateContractDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Contract>;
  updateStatus(
    id: string,
    status: ContractStatus,
    tx?: Prisma.TransactionClient
  ): Promise<Contract>;
  cancel(id: string, tx?: Prisma.TransactionClient): Promise<void>;
}
