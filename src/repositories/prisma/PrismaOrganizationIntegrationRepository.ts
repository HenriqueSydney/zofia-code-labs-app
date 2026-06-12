import { prisma } from "@/lib/prisma";
import { OrganizationIntegration, Prisma } from "@/generated/prisma/client";
import {
  IOrganizationIntegrationRepository,
  OrganizationIntegrationWithDetails,
  OrganizationIntegrationWithSafeInformation,
} from "../IOrganizationIntegrationRepository";
import { OrganizationIntegrationWhereInput } from "@/generated/prisma/models";

export class PrismaOrganizationIntegrationRepository implements IOrganizationIntegrationRepository {
  async create(
    data: Prisma.OrganizationIntegrationUncheckedCreateInput,
  ): Promise<OrganizationIntegration> {
    return await prisma.organizationIntegration.create({
      data,
      include: { integrationType: true },
    });
  }

  async findById(
    id: string,
  ): Promise<OrganizationIntegrationWithDetails | null> {
    return await prisma.organizationIntegration.findUnique({
      where: { id },
      include: {
        integrationType: true,
        projectIntegrations: {
          include: {
            project: { select: { slug: true } },
          },
        },
      },
    });
  }

  async findByOrgAndType(
    organizationId: string,
    integrationTypeId: string,
  ): Promise<OrganizationIntegrationWithDetails | null> {
    return await prisma.organizationIntegration.findUnique({
      where: {
        organizationId_integrationTypeId: {
          organizationId,
          integrationTypeId,
        },
      },
      include: {
        integrationType: true,
        projectIntegrations: {
          include: {
            project: { select: { slug: true } },
          },
        },
      },
    });
  }

  async findByOrgAndSlug(
    organizationId: string,
    slug: string,
  ): Promise<OrganizationIntegrationWithDetails | null> {
    return await prisma.organizationIntegration.findFirst({
      where: {
        organizationId,
        integrationType: { slug },
      },
      include: {
        integrationType: true,
        projectIntegrations: {
          include: {
            project: { select: { slug: true } },
          },
        },
      },
    });
  }

  async listByOrganization(
    organizationId: string,
    query?: string,
  ): Promise<OrganizationIntegration[]> {
    const where: OrganizationIntegrationWhereInput = query
      ? {
          OR: [
            {
              integrationType: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            {
              integrationType: {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
          organizationId,
        }
      : { organizationId };

    return await prisma.organizationIntegration.findMany({
      where,
      include: { integrationType: true },
      orderBy: { integrationType: { name: "asc" } },
    });
  }

  async update(
    id: string,
    data: Prisma.OrganizationIntegrationUpdateInput,
  ): Promise<OrganizationIntegration> {
    return await prisma.organizationIntegration.update({
      where: { id },
      data,
      include: { integrationType: true },
    });
  }

  async updateHealthStatus(
    id: string,
    status: any,
    lastError?: string,
  ): Promise<void> {
    await prisma.organizationIntegration.update({
      where: { id },
      data: {
        healthStatus: status,
        lastError: lastError || null,
        lastHealthCheck: new Date(),
        // Incrementa o contador de erros se o status for ERROR
        errorCount: status === "ERROR" ? { increment: 1 } : 0,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.organizationIntegration.delete({
      where: { id },
    });
  }

  async findManyByTags(
    organizationId: string,
    tags: string[] | string,
  ): Promise<OrganizationIntegrationWithSafeInformation[]> {
    const tagList = Array.isArray(tags) ? tags : [tags];

    const orgIntegrations = await prisma.organizationIntegration.findMany({
      include: {
        integrationType: true,
      },
      where: {
        organizationId,
        integrationType: {
          deletedAt: null,
        },
      },
    });

    return orgIntegrations
      .filter((orgIntegration) => {
        const fieldsSchema = JSON.stringify(
          orgIntegration.integrationType.fieldsSchema,
        );

        return tagList.some((tag) => fieldsSchema.includes(tag));
      })
      .map((orgIntegration) => ({
        id: orgIntegration.id,
        organizationId: orgIntegration.organizationId,
        integrationTypeId: orgIntegration.integrationTypeId,
        healthStatus: orgIntegration.healthStatus,
        enabled: orgIntegration.enabled,
        integrationType: {
          name: orgIntegration.integrationType.name,
          slug: orgIntegration.integrationType.slug,
          logo: orgIntegration.integrationType.logo,
        },
      }));
  }
}
