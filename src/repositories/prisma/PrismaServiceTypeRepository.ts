import { prisma } from "@/lib/prisma";
import {
  IServiceTypeRepository,
  CreateServiceDTO,
  FetchServiceTypeWithCategory,
} from "../IServiceTypeRepository";
import { Prisma, ServiceType } from "@/generated/prisma/client";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { PrismaToPlain } from "@/@types/PrismaToPlain";

export class PrismaServiceTypeRepository implements IServiceTypeRepository {
  async create(data: CreateServiceDTO): Promise<PrismaToPlain<ServiceType>> {
    const serviceType = await prisma.serviceType.create({
      data,
    });

    const plain = normalizePrisma(serviceType);

    return plain as PrismaToPlain<ServiceType>;
  }

  async update(
    id: string,
    data: Partial<CreateServiceDTO>,
  ): Promise<PrismaToPlain<ServiceType>> {
    const serviceType = await prisma.serviceType.update({
      where: { id },
      data,
    });
    const plain = normalizePrisma(serviceType);

    return plain as PrismaToPlain<ServiceType>;
  }

  async delete(id: string): Promise<void> {
    await prisma.serviceType.update({
      data: {
        active: false,
      },
      where: { id },
    });
  }

  async list(query?: string | null): Promise<FetchServiceTypeWithCategory[]> {
    let where: Prisma.ServiceTypeWhereInput = {};

    if (query) {
      where = {
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
          {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      };
    }

    const serviceTypes = await prisma.serviceType.findMany({
      include: {
        category: true,
      },
      where,
    });

    const plain = serviceTypes.map(normalizePrisma);

    return plain as FetchServiceTypeWithCategory[];
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<FetchServiceTypeWithCategory | null> {
    const serviceType = await prisma.serviceType.findFirst({
      where: {
        id,
        organizationId, // CLÁUSULA DE SEGURANÇA MULTI-TENANT
      },
      include: {
        category: true,
      },
    });

    if (!serviceType) return null;

    const plain = normalizePrisma(serviceType);

    return plain;
  }

  async findManyByIds(
    serviceIds: string[],
    organizationId: string,
  ): Promise<PrismaToPlain<ServiceType>[]> {
    const serviceTypes = await prisma.serviceType.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        organizationId, // CLÁUSULA DE SEGURANÇA MULTI-TENANT
      },
    });

    const plain = serviceTypes.map(normalizePrisma);

    return plain as PrismaToPlain<ServiceType>[];
  }

  async findByName(
    name: string,
    organizationId: string,
  ): Promise<PrismaToPlain<ServiceType> | null> {
    const serviceType = await prisma.serviceType.findFirst({
      where: {
        name,
        organizationId,
      },
    });

    const plain = normalizePrisma(serviceType);

    return plain as PrismaToPlain<ServiceType> | null;
  }
}
