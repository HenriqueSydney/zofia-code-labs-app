import { prisma } from "@/lib/prisma";
import {
  ISonarQubeRepository,
  SonarProjectEntity,
  SonarSnapshotEntity,
} from "../ISonarQubeRepository";
import { FullDashboardData } from "@/services/codeQuality/ICodeQualityService";

export class PrismaSonarQubeRepository implements ISonarQubeRepository {
  // Mapper para resolver o erro de incompatibilidade de tipos (string vs literal)
  private mapToSnapshotEntity(data: any): SonarSnapshotEntity {
    return {
      ...data,
      status: data.status as "OK" | "ERROR" | "WARN",
      gateConditions: data.gateConditions?.map((condition: any) => ({
        ...condition,
        status: condition.status as "OK" | "ERROR" | "WARN",
      })),
    };
  }



  async saveSnapshot(
    projectId: string,
    data: FullDashboardData
  ): Promise<void> {
    const { metrics, qualityGate } = data;

    await prisma.$transaction(async (tx) => {
      await tx.sonarMetricSnapshot.create({
        data: {
          projectId,
          bugs: metrics.bugs,
          vulnerabilities: metrics.vulnerabilities,
          codeSmells: metrics.codeSmells,
          coverage: metrics.coverage,
          duplications: metrics.duplications,
          technicalDebt: metrics.technicalDebt,
          status: metrics.status,
          securityRating: metrics.securityRating,

          blockerViolations:
            metrics.severity.find((s) => s.name === "Blocker")?.value || 0,
          criticalViolations:
            metrics.severity.find((s) => s.name === "Critical")?.value || 0,
          majorViolations:
            metrics.severity.find((s) => s.name === "Major")?.value || 0,
          minorViolations:
            metrics.severity.find((s) => s.name === "Minor")?.value || 0,
          infoViolations:
            metrics.severity.find((s) => s.name === "Info")?.value || 0,

          gateConditions: {
            create: qualityGate.map((condition) => ({
              metric: condition.metric,
              value: String(condition.value),
              threshold: String(condition.threshold),
              status: condition.status,
            })),
          },
        },
      });
    });
  }

  async getSnapshotAt(
    projectId: string,
    date: Date
  ): Promise<SonarSnapshotEntity | null> {
    const result = await prisma.sonarMetricSnapshot.findFirst({
      where: {
        projectId,
        timestamp: { lte: date },
      },
      orderBy: { timestamp: "desc" },
    });

    return result ? this.mapToSnapshotEntity(result) : null;
  }

  async getLatestSnapshot(
    projectId: string
  ): Promise<SonarSnapshotEntity | null> {
    const result = await prisma.sonarMetricSnapshot.findFirst({
      where: { projectId },
      orderBy: { timestamp: "desc" },
      include: { gateConditions: true },
    });

    return result ? this.mapToSnapshotEntity(result) : null;
  }

  async getHistory(
    projectId: string,
    limit = 12
  ): Promise<SonarSnapshotEntity[]> {
    const results = await prisma.sonarMetricSnapshot.findMany({
      where: { projectId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return results.map((r) => this.mapToSnapshotEntity(r));
  }
}
