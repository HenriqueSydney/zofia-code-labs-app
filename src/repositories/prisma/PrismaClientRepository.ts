import { prisma } from "@/lib/prisma";
import {
  IClientsRepository,
  ICreateClientDTO,
  IUpdateClientDTO,
} from "../IClientsRepository";
import { Client, Prisma } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";

export class PrismaClientsRepository implements IClientsRepository {
  async create(data: ICreateClientDTO): Promise<Client> {
    const client = await prisma.client.create({
      data,
    });
    return client;
  }

  async update(data: IUpdateClientDTO): Promise<Client> {
    const { id, ...updateData } = data;
    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });
    return client;
  }

  async delete(id: string): Promise<void> {
    await prisma.client.update({
      data: {
        deletedAt: date().toDate(),
      },
      where: { id },
    });
  }

  async findById(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { id },
    });
    return client;
  }

  async findByCnpj(cnpj: string): Promise<Client | null> {
    const client = await prisma.client.findFirst({
      where: { cnpj },
    });
    return client;
  }

  async fetchClients(
    organizationId: string,
    query?: string | null
  ): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {
      organizationId,
    };

    if (query) {
      where.OR = [
        { companyName: { contains: query, mode: "insensitive" } },
        { tradeName: { contains: query, mode: "insensitive" } },
        { cnpj: { contains: query } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return clients;
  }
}
