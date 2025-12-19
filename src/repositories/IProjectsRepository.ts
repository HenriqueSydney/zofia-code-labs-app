import { Pagination } from "@/@types/Pagination";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import {
  Prisma,
  Project,
  ProjectDocuments,
  ProjectServices,
  ProjectStatus,
  Proposal,
  ServiceType,
} from "@/generated/prisma/client";

export type ProjectWithDetails = PrismaToPlain<Project> & {
  client: { id: string; companyName: string };
  projectDocuments: ProjectDocuments[];
  proposal: PrismaToPlain<Proposal>;
  projectServices: (ProjectServices & {
    serviceType: ServiceType;
  })[];
};

export type FindAllParams = {
  query?: string;
  organizationId: string;
};

// NOVO: Tipo auxiliar para o documento
export type DocumentInput = {
  url: string;
  originalName: string;
  extension: string;
};

export interface ICreateProjectDTO {
  name: string;
  description: string;
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
    data: ICreateProjectDTO
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">>;
  findById(id: string): Promise<ProjectWithDetails | null>;
  findAll(
    params: FindAllParams,
    pagination?: Pagination
  ): Promise<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }>;
  update(
    data: IUpdateProjectDTO
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
