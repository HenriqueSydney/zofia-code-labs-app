import { prisma } from "@/lib/prisma"; // Supondo que seu cliente prisma esteja aqui
import { IntegrationType, Prisma } from "@/generated/prisma/client";
import { IIntegrationTypeRepository } from "../IIntegrationTypeRepository";
import { date } from "@/lib/dayjs";

export class PrismaIntegrationTypeRepository implements IIntegrationTypeRepository {
  async create(
    data: Prisma.IntegrationTypeCreateInput,
  ): Promise<IntegrationType> {
    return await prisma.integrationType.create({
      data,
    });
  }

  async findById(id: string): Promise<IntegrationType | null> {
    return await prisma.integrationType.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<IntegrationType | null> {
    return await prisma.integrationType.findUnique({
      where: { slug },
    });
  }

  async listAll(query?: string): Promise<IntegrationType[]> {
    const where: Prisma.IntegrationTypeWhereInput = query
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
          deletedAt: null,
        }
      : {
          deletedAt: null,
        };

    return await prisma.integrationType.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async update(
    id: string,
    data: Prisma.IntegrationTypeUpdateInput,
  ): Promise<IntegrationType> {
    return await prisma.integrationType.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.integrationType.update({
      data: {
        deletedAt: date().toDate(),
      },
      where: { id },
    });
  }
}
