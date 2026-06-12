import { randomUUID } from "node:crypto";

import { FullDashboardData } from "../../services/codeQuality/ICodeQualityService";
import { date } from "../../lib/dayjs";
import {
  ISonarQubeRepository,
  SonarQualityGateConditionEntity,
  SonarSnapshotEntity,
} from "../ISonarQubeRepository";

export class InMemorySonarQubeRepository implements ISonarQubeRepository {
  public items: SonarSnapshotEntity[] = [];

  async saveSnapshot(
    projectId: string,
    data: FullDashboardData,
  ): Promise<void> {
    const { metrics, qualityGate } = data;
    const snapshotId = randomUUID();
    const now = date().toDate();

    const gateConditions: SonarQualityGateConditionEntity[] =
      qualityGate.map((condition) => ({
        id: randomUUID(),
        snapshotId,
        metric: condition.metric,
        value: String(condition.value),
        threshold: String(condition.threshold),
        status: condition.status,
      }));

    const snapshot: SonarSnapshotEntity = {
      id: snapshotId,
      projectId,
      timestamp: now,
      bugs: metrics.bugs,
      vulnerabilities: metrics.vulnerabilities,
      codeSmells: metrics.codeSmells,
      coverage: metrics.coverage,
      duplications: metrics.duplications,
      technicalDebt: metrics.technicalDebt,
      status: metrics.status,
      securityRating: metrics.securityRating,
      blockerViolations:
        metrics.severity.find((s) => s.name === "Blocker")?.value ?? 0,
      criticalViolations:
        metrics.severity.find((s) => s.name === "Critical")?.value ?? 0,
      majorViolations:
        metrics.severity.find((s) => s.name === "Major")?.value ?? 0,
      minorViolations:
        metrics.severity.find((s) => s.name === "Minor")?.value ?? 0,
      infoViolations:
        metrics.severity.find((s) => s.name === "Info")?.value ?? 0,
      gateConditions,
    };

    this.items.push(snapshot);
  }

  async getSnapshotAt(
    projectId: string,
    at: Date,
  ): Promise<SonarSnapshotEntity | null> {
    const snapshots = this.items
      .filter(
        (item) =>
          item.projectId === projectId &&
          item.timestamp.getTime() <= at.getTime(),
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return snapshots[0] ?? null;
  }

  async getLatestSnapshot(
    projectId: string,
  ): Promise<SonarSnapshotEntity | null> {
    const snapshots = this.items
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return snapshots[0] ?? null;
  }

  async getHistory(
    projectId: string,
    limit = 12,
  ): Promise<SonarSnapshotEntity[]> {
    return this.items
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
