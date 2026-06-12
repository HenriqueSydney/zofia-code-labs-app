import { Pagination } from "@/@types/Pagination";
import { Prisma, Contract } from "@/generated/prisma/client";
import {
  DiscountType,
  ContractStatus,
  ContractSource,
} from "@/generated/prisma/enums";
import { Decimal } from "@prisma/client/runtime/client";

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
    content: unknown;
  } | null;
  project: {
    organizationId: string;
    name: string;
    slug: string;
    client: {
      id: string;
      tradeName: string;
      companyName: string;
      email: string;
      slug: string;
      responsibleName?: string | null;
      responsibleEmail?: string | null;
    };
  };
  proposal: {
    totalValue: Decimal;
  };
  createdUser: { name: string | null } | null;
  approvedUser: { name: string | null } | null;
  reviewUser: { name: string | null } | null;
};

export type ListContractParams = {
  organizationId: string;
  query?: string;
};

export type ContractWithProjectDetails = Contract & {
  project: {
    organizationId: string;
    slug: string;
    client: { slug: string };
  };
};

export interface IContractRepository {
  create(
    data: CreateContractDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<ContractWithProjectDetails>;
  findById(id: string): Promise<ContractWithDetails | null>;
  findAllByClient(
    clientId: string,
    pagination: Pagination,
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }>;
  list(
    filter: ListContractParams,
    pagination: Pagination,
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }>;
  getHistory(
    projectId: string,
    pagination: Pagination,
  ): Promise<{ contracts: ContractWithDetails[]; totalOfRegister: number }>;
  update(
    id: string,
    data: UpdateContractDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<ContractWithProjectDetails>;
  updateStatus(
    id: string,
    status: ContractStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<ContractWithProjectDetails>;
  cancel(id: string, tx?: Prisma.TransactionClient): Promise<void>;
}
