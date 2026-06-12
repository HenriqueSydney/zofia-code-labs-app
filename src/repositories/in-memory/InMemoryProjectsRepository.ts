import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { DocumentInput } from "../../@types/DocumentInput";
import { Pagination } from "../../@types/Pagination";
import {
  Client,
  Contract,
  Prisma,
  Project,
  ProjectDocuments,
  ProjectServices,
  ProjectStatus,
  Proposal,
  ServiceType,
} from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import { getPaginationQuery } from "../../utils/getPaginationQuery";
import {
  FindAllParams,
  ICreateProjectDTO,
  IProjectsRepository,
  IUpdateProjectDTO,
  ProjectWithDetails,
  UpdateProjectReturn,
} from "../IProjectsRepository";

type ProjectClientRef = {
  id: string;
  companyName: string;
  slug: string;
  tradeName: string;
  email: string;
};

type ProjectListItem = Omit<ProjectWithDetails, "projectServices" | "proposal">;

export class InMemoryProjectsRepository implements IProjectsRepository {
  public items: Project[] = [];
  public projectDocuments: ProjectDocuments[] = [];
  public projectServices: ProjectServices[] = [];
  public clients: ProjectClientRef[] = [];
  public proposals: Proposal[] = [];
  public contracts: Contract[] = [];
  public serviceTypes: ServiceType[] = [];

  async create(
    data: ICreateProjectDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ProjectListItem> {
    const now = date().toDate();
    const project: Project = {
      id: randomUUID(),
      organizationId: data.organizationId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      clientId: data.clientId,
      status: "DRAFT",
      priority: data.priority ?? "MEDIUM",
      health: data.health ?? "ON_TRACK",
      tags: data.tags ?? [],
      estimatedStartDate: data.estimatedStartDate ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      totalBudget: new Decimal(data.totalBudget ?? 0),
      totalSpent: new Decimal(0),
      remainingBudget: new Decimal(data.totalBudget ?? 0),
      createdBy: data.createdBy,
      memberId: null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(project);

    const docsToSave = Array.isArray(data.documents) ? data.documents : [];
    for (const doc of docsToSave) {
      this.projectDocuments.push(this.buildDocument(project.id, doc));
    }

    return this.toListItem(project);
  }

  async findById(id: string): Promise<ProjectWithDetails | null> {
    const project = this.items.find((item) => item.id === id);
    if (!project) return null;
    return this.toDetails(project);
  }

  async findBySlug(slug: string): Promise<ProjectWithDetails | null> {
    const project = this.items.find((item) => item.slug === slug);
    if (!project) return null;
    return this.toDetails(project);
  }

  async findAll(
    params: FindAllParams,
    pagination?: Pagination,
  ): Promise<{ totalOfRegisters: number; projects: ProjectListItem[] }> {
    let filtered = this.items.filter(
      (project) => project.organizationId === params.organizationId,
    );

    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          (project.description?.toLowerCase().includes(query) ?? false),
      );
    }

    if (params.cliendId) {
      filtered = filtered.filter((project) => project.clientId === params.cliendId);
    }

    if (params.clientSlug) {
      const clientIds = this.clients
        .filter((client) => client.slug === params.clientSlug)
        .map((client) => client.id);
      filtered = filtered.filter((project) => clientIds.includes(project.clientId));
    }

    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalOfRegisters = filtered.length;
    const paginationDef = getPaginationQuery(pagination);
    const skip = "skip" in paginationDef ? (paginationDef.skip as number) : 0;
    const take =
      "take" in paginationDef ? (paginationDef.take as number) : filtered.length;

    const projects = filtered
      .slice(skip, skip + take)
      .map((project) => this.toListItem(project));

    return { totalOfRegisters, projects };
  }

  async update(
    data: IUpdateProjectDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ProjectListItem> {
    const index = this.items.findIndex((item) => item.id === data.id);
    if (index === -1) {
      throw new Error("Project not found");
    }

    const current = this.items[index];
    const updated: Project = {
      ...current,
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      clientId: data.clientId ?? current.clientId,
      priority: data.priority ?? current.priority,
      health: data.health ?? current.health,
      tags: data.tags ?? current.tags,
      estimatedStartDate:
        data.estimatedStartDate !== undefined
          ? data.estimatedStartDate
          : current.estimatedStartDate,
      startDate:
        data.startDate !== undefined ? data.startDate : current.startDate,
      endDate: data.endDate !== undefined ? data.endDate : current.endDate,
      totalBudget:
        data.totalBudget !== undefined
          ? new Decimal(data.totalBudget)
          : current.totalBudget,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;

    if (data.documents && data.documents.length > 0) {
      for (const doc of data.documents) {
        this.projectDocuments.push(this.buildDocument(updated.id, doc));
      }
    }

    return this.toListItem(updated);
  }

  async updateStatus(
    id: string,
    status: ProjectStatus,
    _tx?: Prisma.TransactionClient,
  ): Promise<UpdateProjectReturn> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Project not found");
    }

    this.items[index] = {
      ...this.items[index],
      status,
      updatedAt: date().toDate(),
    };

    const project = this.items[index];
    const client = this.resolveClient(project.clientId);

    return {
      ...project,
      client: client as Client,
    };
  }

  async cancel(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Project not found");
    }
    this.items[index] = {
      ...this.items[index],
      status: "CANCELLED",
      updatedAt: date().toDate(),
    };
  }

  async deleteDocument(documentId: string): Promise<ProjectDocuments | null> {
    const document = this.projectDocuments.find((item) => item.id === documentId);
    if (!document) return null;
    this.projectDocuments = this.projectDocuments.filter(
      (item) => item.id !== documentId,
    );
    return document;
  }

  async addDocuments(
    projectId: string,
    documents: DocumentInput[],
  ): Promise<ProjectListItem> {
    const project = this.items.find((item) => item.id === projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    for (const doc of documents) {
      this.projectDocuments.push(this.buildDocument(projectId, doc));
    }

    return this.toListItem(project);
  }

  async updateProjectServices(
    projectId: string,
    serviceIds: string[],
    _tx?: Prisma.TransactionClient,
  ): Promise<void> {
    this.projectServices = this.projectServices.filter(
      (item) => item.projectId !== projectId,
    );

    for (const serviceTypeId of serviceIds) {
      this.projectServices.push({ projectId, serviceTypeId });
    }
  }

  private buildDocument(projectId: string, doc: DocumentInput): ProjectDocuments {
    return {
      id: randomUUID(),
      projectId,
      name: doc.originalName,
      extension: doc.extension,
      documentUrlReference: doc.url,
      createdAt: date().toDate(),
    };
  }

  private resolveClient(clientId: string): ProjectClientRef {
    return (
      this.clients.find((client) => client.id === clientId) ?? {
        id: clientId,
        companyName: "Unknown Client",
        slug: "unknown-client",
        tradeName: "Unknown Client",
        email: "unknown@client.test",
      }
    );
  }

  private getCurrentProposal(projectId: string): Proposal | null {
    return (
      this.proposals.find(
        (proposal) =>
          proposal.projectId === projectId &&
          proposal.isCurrent &&
          !["CANCELLED", "REJECTED"].includes(proposal.status),
      ) ?? null
    );
  }

  private getCurrentContract(projectId: string): Contract | null {
    return (
      this.contracts.find(
        (contract) => contract.projectId === projectId && contract.isCurrent,
      ) ?? null
    );
  }

  private toListItem(project: Project): ProjectListItem {
    const client = this.resolveClient(project.clientId);

    return {
      ...project,
      client,
      projectDocuments: this.projectDocuments.filter(
        (doc) => doc.projectId === project.id,
      ),
      contract: this.getCurrentContract(project.id) as Contract,
    };
  }

  private toDetails(project: Project): ProjectWithDetails {
    const client = this.resolveClient(project.clientId);
    const proposal = this.getCurrentProposal(project.id);
    const contract = this.getCurrentContract(project.id);

    const projectServices = this.projectServices
      .filter((item) => item.projectId === project.id)
      .map((item) => ({
        ...item,
        serviceType:
          this.serviceTypes.find(
            (serviceType) => serviceType.id === item.serviceTypeId,
          ) ??
          ({
            id: item.serviceTypeId,
            name: "Unknown Service",
          } as ServiceType),
      }));

    return {
      ...project,
      client,
      projectDocuments: this.projectDocuments.filter(
        (doc) => doc.projectId === project.id,
      ),
      proposal: proposal as Proposal,
      contract: contract as Contract,
      projectServices,
    };
  }
}
