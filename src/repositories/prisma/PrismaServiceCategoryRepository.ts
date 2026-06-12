import { prisma } from "@/lib/prisma";
import { IServiceCategoryRepository } from "../IServiceCategoryRepository";
import { Prisma, ServiceCategory } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";

export class PrismaServiceCategoryRepository implements IServiceCategoryRepository {
  async create(
    data: Prisma.ServiceCategoryUncheckedCreateInput,
  ): Promise<ServiceCategory> {
    return await prisma.serviceCategory.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<Prisma.ServiceCategoryUncheckedCreateInput>,
  ): Promise<ServiceCategory> {
    return await prisma.serviceCategory.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.serviceCategory.update({
      data: {
        deletedAt: date().toDate(),
      },
      where: { id },
    });
  }

  async list(
    organizationId: string,
    query?: string | null,
  ): Promise<ServiceCategory[]> {
    let where: Prisma.ServiceCategoryWhereInput = {
      organizationId,
    };

    if (query) {
      where = {
        ...where,
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
      };
    }

    const serviceCategories = await prisma.serviceCategory.findMany({
      where,
    });

    return serviceCategories;
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<ServiceCategory | null> {
    return await prisma.serviceCategory.findFirst({
      where: {
        id,
        organizationId,
      },
    });
  }

  async findByName(
    name: string,
    organizationId: string,
  ): Promise<ServiceCategory | null> {
    return await prisma.serviceCategory.findFirst({
      where: {
        name,
        organizationId,
      },
    });
  }
}
