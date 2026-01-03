import { prisma } from "@/lib/prisma";
import {
  ClientEmployeesWithDetails,
  IClientEmployeesRepository,
} from "../IClientEmployeesRepository";
import { ClientEmployees, Prisma } from "@/generated/prisma/client";

export class PrismaClientEmployeesRepository
  implements IClientEmployeesRepository
{
  async create(
    data: Prisma.ClientEmployeesUncheckedCreateInput
  ): Promise<ClientEmployees> {
    return await prisma.clientEmployees.create({
      data: {
        ...data,
        status: "PENDING", // Garantindo o status inicial
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ClientEmployeesUncheckedUpdateInput
  ): Promise<ClientEmployees> {
    return await prisma.clientEmployees.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.clientEmployees.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });
  }

  async findById(id: string): Promise<ClientEmployees | null> {
    return await prisma.clientEmployees.findFirst({
      where: { id, deletedAt: null },
      include: { user: true },
    });
  }

  async findByClientAndUser(
    clientId: string,
    userId: string
  ): Promise<ClientEmployees | null> {
    return await prisma.clientEmployees.findFirst({
      where: { clientId, userId, deletedAt: null },
    });
  }

  async listByClient(clientId: string): Promise<ClientEmployeesWithDetails[]> {
    const employees = await prisma.clientEmployees.findMany({
      where: {
        clientId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            image: true,
            loginHistories: {
              select: {
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc", // Pega o mais recente
              },
              take: 1, // Limita a apenas 1 registro
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return employees as ClientEmployeesWithDetails[];
  }
}
