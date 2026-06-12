import { DocumentInput } from "@/@types/DocumentInput";
import { Pagination } from "@/@types/Pagination";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import {
  Client,
  Contract,
  Priority,
  Prisma,
  Project,
  ProjectDocuments,
  ProjectHealth,
  ProjectServices,
  ProjectStatus,
  Proposal,
  ServiceType,
} from "@/generated/prisma/client";

export type ProjectWithDetails = PrismaToPlain<Project> & {
  client: {
    id: string;
    companyName: string;
    slug: string;
    tradeName: string;
    email: string;
  };
  projectDocuments: ProjectDocuments[];
  proposal: PrismaToPlain<Proposal>;
  contract: Contract;
  projectServices: (ProjectServices & {
    serviceType: ServiceType;
  })[];
};

export type FindAllParams = {
  query?: string;
  cliendId?: string;
  clientSlug?: string;
  organizationId: string;
};

// NOVO: Tipo auxiliar para o documento

export interface ICreateProjectDTO {
  name: string;
  description: string;
  slug: string;
  clientId: string;
  createdBy: string;
  organizationId: string;

  priority?: Priority;
  health?: ProjectHealth;
  tags?: string[];

  totalBudget?: number;

  // Permite passar null para limpar a data se necessário
  estimatedStartDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  documents?: DocumentInput[];
}

export interface IUpdateProjectDTO {
  id: string;
  name?: string;
  description?: string;
  clientId?: string;

  priority?: Priority;
  health?: ProjectHealth;
  tags?: string[];

  totalBudget?: number;

  // Permite passar null para limpar a data se necessário
  estimatedStartDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;

  documents?: DocumentInput[];
}

export type UpdateProjectReturn = PrismaToPlain<Project> & {
  client: Client;
};

export interface IProjectsRepository {
  create(
    data: ICreateProjectDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  findById(id: string): Promise<ProjectWithDetails | null>;
  findBySlug(slug: string): Promise<ProjectWithDetails | null>;
  findAll(
    params: FindAllParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }>;
  update(
    data: IUpdateProjectDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  updateStatus(
    id: string,
    status: ProjectStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<UpdateProjectReturn>;
  cancel(id: string): Promise<void>;
  deleteDocument(documentId: string): Promise<ProjectDocuments | null>;
  addDocuments(
    projectId: string,
    documents: DocumentInput[],
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  updateProjectServices(
    projectId: string,
    serviceIds: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
}
