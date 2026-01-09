import { prisma } from "@/lib/prisma";
import {
  IUmamiRepository,
  UmamiSnapshotEntity,
  UmamiDashboardData,
} from "../IUmamiRepository";

export class PrismaUmamiRepository implements IUmamiRepository {
  async saveSnapshot(
    projectId: string,
    data: UmamiDashboardData
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.umamiMetricSnapshot.create({
        data: {
          projectId,
          pageviews: data.pageviews,
          visitors: data.visitors,
          visits: data.visits,
          bounceRate: data.bounceRate,
          totalTime: data.totalTime,
          avgDuration: data.avgDuration,
          pagesPerSession: data.pagesPerSession,
          breakdown: data.breakdown || {},
        },
      });
    });
  }

  async getSnapshotAt(
    projectId: string,
    date: Date
  ): Promise<UmamiSnapshotEntity | null> {
    const result = await prisma.umamiMetricSnapshot.findFirst({
      where: {
        projectId,
        timestamp: { lte: date },
      },
      orderBy: { timestamp: "desc" },
    });

    return result as UmamiSnapshotEntity | null;
  }

  async getLatestSnapshot(
    projectId: string
  ): Promise<UmamiSnapshotEntity | null> {
    const result = await prisma.umamiMetricSnapshot.findFirst({
      where: { projectId },
      orderBy: { timestamp: "desc" },
    });

    return result as UmamiSnapshotEntity | null;
  }

  async getHistory(
    projectId: string,
    limit = 12
  ): Promise<UmamiSnapshotEntity[]> {
    const results = await prisma.umamiMetricSnapshot.findMany({
      where: { projectId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return results as UmamiSnapshotEntity[];
  }
}
