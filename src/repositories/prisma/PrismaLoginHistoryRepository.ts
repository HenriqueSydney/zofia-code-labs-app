import { LoginHistory } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ICreateLoginHistoryDTO,
  ILoginHistoryRepository,
} from "../ILoginHistoryRepository";

export class PrismaLoginHistoryRepository implements ILoginHistoryRepository {
  async create(data: ICreateLoginHistoryDTO): Promise<LoginHistory> {
    return prisma.loginHistory.create({ data });
  }

  async findByUserId(userId: string): Promise<LoginHistory[]> {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async shouldNotifyUnknownLogin(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<boolean> {
    const totalLogins = await prisma.loginHistory.count({
      where: { userId },
    });

    if (totalLogins === 0) {
      return false;
    }

    const knownDevice = await prisma.loginHistory.findFirst({
      where: {
        userId,
        ipAddress,
        userAgent,
      },
    });

    return !knownDevice;
  }
}
