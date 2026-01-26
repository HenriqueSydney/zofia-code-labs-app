import { prisma } from "@/lib/prisma";
import {
  IProjectsRepository,
  ICreateProjectDTO,
  IUpdateProjectDTO,
  ProjectWithDetails,
  FindAllParams,
  UpdateProjectReturn,
} from "../IProjectsRepository";
import { Pagination } from "@/@types/Pagination";
import {
  Prisma,
  Project,
  ProjectDocuments,
  ProjectStatus,
} from "@/generated/prisma/client";
import { getPaginationQuery } from "@/utils/getPaginationQuery";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { DocumentInput } from "@/@types/DocumentInput";

export class PrismaProjectsRepository implements IProjectsRepository {
  async create(
    data: ICreateProjectDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">> {
    const client = tx || prisma;
    // Desestrutura 'documents' ao invés de 'documentUrls'
    const { documents, ...projectData } = data;

    const docsToSave = Array.isArray(documents) ? documents : [];

    const documentsCreateInput =
      docsToSave.length > 0
        ? {
            projectDocuments: {
              create: docsToSave.map((doc) => ({
                documentUrlReference: doc.url,
                name: doc.originalName, // Salva o nome original
                extension: doc.extension, // Salva a extensão
              })),
            },
          }
        : {};

    const project = await client.project.create({
      data: {
        ...projectData,
        status: "DRAFT",
        ...documentsCreateInput,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        projectDocuments: true,
      },
    });
    return project as any;
  }

  async findById(id: string): Promise<ProjectWithDetails | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, companyName: true, slug: true, tradeName: true },
        },
        projectDocuments: true,
        proposal: {
          where: {
            isCurrent: true,
            status: { notIn: ["CANCELLED", "REJECTED"] },
          },
          take: 1, // Otimização para pegar apenas a atual
          include: {
            items: true,
            proposalTemplate: true,
          },
        },
        contracts: {
          where: { isCurrent: true },
          take: 1,
          include: {
            contractTemplate: true,
          },
        },
        projectServices: {
          include: {
            serviceType: true,
          },
        },
      },
    });

    if (!project) return null;

    const plain = normalizePrisma({
      ...project,
      proposal: project.proposal[0] || null,
      contract: project.contracts[0] || null,
    });

    return plain as ProjectWithDetails;
  }

  async findBySlug(slug: string): Promise<ProjectWithDetails | null> {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        client: {
          select: { id: true, companyName: true, slug: true, tradeName: true },
        },
        projectDocuments: true,
        proposal: {
          where: {
            isCurrent: true,
            status: { notIn: ["CANCELLED", "REJECTED"] },
          },
          take: 1, // Otimização para pegar apenas a atual
          include: {
            items: true,
            proposalTemplate: true,
          },
        },
        contracts: {
          where: { isCurrent: true },
          take: 1,
          include: {
            contractTemplate: true,
          },
        },
        projectServices: {
          include: {
            serviceType: true,
          },
        },
      },
    });

    if (!project) return null;

    const plain = normalizePrisma({
      ...project,
      proposal: project.proposal[0] || null,
      contract: project.contracts[0] || null,
    });

    return plain as ProjectWithDetails;
  }

  async findAll(
    params: FindAllParams,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices">[];
  }> {
    let where: Prisma.ProjectWhereInput = params.query
      ? {
          OR: [
            { name: { contains: params.query, mode: "insensitive" } },
            { description: { contains: params.query, mode: "insensitive" } },
          ],
          organizationId: params.organizationId,
        }
      : {
          organizationId: params.organizationId,
        };

    if (params.cliendId) {
      where = {
        ...where,
        clientId: params.cliendId,
      };
    }

    if (params.cliendId) {
      where = {
        ...where,
        client: {
          slug: params.clientSlug,
        },
      };
    }

    const paginationDef = pagination ? getPaginationQuery(pagination) : {};

    const [totalOfRegisters, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        ...paginationDef,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              tradeName: true,
            },
          },
          projectDocuments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const plain = projects.map(normalizePrisma);

    return {
      totalOfRegisters,
      projects: plain as Omit<ProjectWithDetails, "projectServices">[],
    };
  }

  async update(
    data: IUpdateProjectDTO,
    tx?: Prisma.TransactionClient,
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">> {
    const client = tx || prisma;
    // Ajuste para receber documents
    const { id, documents, ...updateData } = data;

    const documentsOperation =
      documents && documents.length > 0
        ? {
            create: documents.map((doc) => ({
              documentUrlReference: doc.url,
              name: doc.originalName, // Salva nome
              extension: doc.extension, // Salva extensão
            })),
          }
        : undefined;

    const project = await client.project.update({
      where: { id },
      data: {
        ...updateData,
        projectDocuments: documentsOperation,
      },
      include: {
        client: {
          select: { id: true, companyName: true, slug: true, tradeName: true },
        },
        projectDocuments: true,
      },
    });

    return project as any;
  }

  async updateStatus(
    id: string,
    status: ProjectStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<UpdateProjectReturn> {
    const client = tx || prisma;
    const project = await client.project.update({
      include: {
        client: true,
      },
      where: { id },
      data: { status },
    });
    return normalizePrisma(project);
  }

  async cancel(id: string): Promise<void> {
    // O Cascade Delete no Schema do Prisma deve lidar com os documentos
    // Se não tiver cascade, precisaria deletar os documents primeiro
    await prisma.project.update({
      data: { status: "CANCELLED" },
      where: { id },
    });
  }

  async deleteDocument(documentId: string): Promise<ProjectDocuments | null> {
    const document = await prisma.projectDocuments.delete({
      where: { id: documentId },
    });
    return document;
  }

  async addDocuments(
    projectId: string,
    documents: DocumentInput[],
  ): Promise<Omit<ProjectWithDetails, "projectServices" | "proposal">> {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        projectDocuments: {
          create: documents.map((doc) => ({
            documentUrlReference: doc.url,
            name: doc.originalName,
            extension: doc.extension,
          })),
        },
      },
      include: {
        client: { select: { id: true, companyName: true } },
        projectDocuments: true,
      },
    });

    return project as Omit<ProjectWithDetails, "projectServices">;
  }

  async updateProjectServices(
    projectId: string,
    serviceIds: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || prisma;

    await client.projectServices.deleteMany({
      where: { projectId },
    });

    if (serviceIds && serviceIds.length > 0) {
      await client.projectServices.createMany({
        data: serviceIds.map((serviceTypeId) => ({
          projectId,
          serviceTypeId,
        })),
        skipDuplicates: true,
      });
    }
  }
}
