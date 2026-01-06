import { prisma } from "@/lib/prisma";
import {
  IProjectIntegrationRepository,
  ProjectIntegrationWithDetails,
} from "../IProjectIntegrationRepository";
import { Prisma, ProjectIntegration } from "@/generated/prisma/client";

export class PrismaProjectIntegrationRepository
  implements IProjectIntegrationRepository
{
  async create(
    data: Prisma.ProjectIntegrationUncheckedCreateInput
  ): Promise<ProjectIntegration> {
    return await prisma.projectIntegration.create({
      data,
    });
  }

  async findById(id: string): Promise<ProjectIntegrationWithDetails | null> {
    return (await prisma.projectIntegration.findUnique({
      where: { id },
      include: {
        integrationType: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
        organizationIntegration: {
          select: {
            organizationId: true,
          },
        },
      },
    })) as ProjectIntegrationWithDetails | null;
  }

  async findByProjectAndType(
    projectId: string,
    typeId: string
  ): Promise<ProjectIntegrationWithDetails | null> {
    return await prisma.projectIntegration.findFirst({
      where: {
        projectId,
        integrationTypeId: typeId,
      },
      include: {
        integrationType: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
        organizationIntegration: {
          select: {
            organizationId: true,
          },
        },
      },
    });
  }

  async findByProjectAndSlug(
    projectSlug: string,
    typeSlug: string
  ): Promise<ProjectIntegrationWithDetails | null> {
    return await prisma.projectIntegration.findFirst({
      where: {
        project: {
          slug: projectSlug,
        },
        integrationType: {
          slug: typeSlug,
        },
      },
      include: {
        integrationType: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
        organizationIntegration: {
          select: {
            organizationId: true,
          },
        },
      },
    });
  }

  async listByProject(
    projectId: string
  ): Promise<ProjectIntegrationWithDetails[]> {
    return (await prisma.projectIntegration.findMany({
      where: { projectId },
      include: {
        integrationType: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as ProjectIntegrationWithDetails[];
  }

  async update(
    id: string,
    data: Prisma.ProjectIntegrationUpdateInput
  ): Promise<ProjectIntegration> {
    return await prisma.projectIntegration.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.projectIntegration.delete({
      where: { id },
    });
  }
}
