import { DocumentInput } from "@/@types/DocumentInput";
import { Pagination } from "@/@types/Pagination";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import {
  Contract,
  Prisma,
  Project,
  ProjectDocuments,
  ProjectServices,
  ProjectStatus,
  Proposal,
  ServiceType,
} from "@/generated/prisma/client";

export type ProjectWithDetails = PrismaToPlain<Project> & {
  client: { id: string; companyName: string; slug: string; tradeName: string };
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
  // Alterado de string[] para DocumentInput[]
  documents?: DocumentInput[];
}

export interface IUpdateProjectDTO {
  id: string;
  name?: string;
  description?: string;
  clientId?: string;
  // Alterado de string[] para DocumentInput[]
  documents?: DocumentInput[];
}

export interface IProjectsRepository {
  create(
    data: ICreateProjectDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  findById(id: string): Promise<ProjectWithDetails | null>;
  findBySlug(slug: string): Promise<ProjectWithDetails | null>;
  findAll(
    params: FindAllParams,
    pagination?: Pagination
  ): Promise<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }>;
  update(
    data: IUpdateProjectDTO,
    tx?: Prisma.TransactionClient
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  updateStatus(
    id: string,
    status: ProjectStatus,
    tx?: Prisma.TransactionClient
  ): Promise<Project>;
  cancel(id: string): Promise<void>;
  deleteDocument(documentId: string): Promise<ProjectDocuments | null>;
  addDocuments(
    projectId: string,
    documents: DocumentInput[]
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  updateProjectServices(
    projectId: string,
    serviceIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<void>;
}
