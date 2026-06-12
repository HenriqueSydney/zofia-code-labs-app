import { randomUUID } from "node:crypto";

import { UmamiBreakdownMetrics } from "../../services/webAnalytics/IWebAnalyticsService";
import { date } from "../../lib/dayjs";
import {
  IUmamiRepository,
  UmamiDashboardData,
  UmamiSnapshotEntity,
} from "../IUmamiRepository";

const emptyBreakdown = (): UmamiBreakdownMetrics => ({
  browsers: [],
  os: [],
  devices: [],
  countries: [],
  pages: [],
  referrers: [],
  history: { pageviews: [], sessions: [] },
  hourlyHistory: { pageviews: [], sessions: [] },
});

export class InMemoryUmamiRepository implements IUmamiRepository {
  public items: UmamiSnapshotEntity[] = [];

  async saveSnapshot(
    projectId: string,
    data: UmamiDashboardData,
  ): Promise<void> {
    const snapshot: UmamiSnapshotEntity = {
      id: randomUUID(),
      projectId,
      timestamp: date().toDate(),
      pageviews: data.pageviews,
      visitors: data.visitors,
      visits: data.visits,
      bounceRate: data.bounceRate,
      totalTime: data.totalTime,
      avgDuration: data.avgDuration,
      pagesPerSession: data.pagesPerSession,
      breakdown: (data.breakdown as UmamiBreakdownMetrics) ?? emptyBreakdown(),
    };

    this.items.push(snapshot);
  }

  async getSnapshotAt(
    projectId: string,
    at: Date,
  ): Promise<UmamiSnapshotEntity | null> {
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
  ): Promise<UmamiSnapshotEntity | null> {
    const snapshots = this.items
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return snapshots[0] ?? null;
  }

  async getHistory(
    projectId: string,
    limit = 12,
  ): Promise<UmamiSnapshotEntity[]> {
    return this.items
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
