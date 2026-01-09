import { UmamiBreakdownMetrics } from "@/services/webAnalytics/IWebAnalyticsService";

export interface UmamiSnapshotEntity {
  id: string;
  projectId: string;
  timestamp: Date;
  pageviews: number;
  visitors: number;
  visits: number;
  bounceRate: number;
  totalTime: number;
  avgDuration: number;
  pagesPerSession: number;
  breakdown: UmamiBreakdownMetrics; // JSON com dados de browsers/dispositivos
}

export interface UmamiDashboardData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounceRate: number;
  totalTime: number;
  avgDuration: number;
  pagesPerSession: number;
  breakdown?: Record<string, any>;
}

export interface UmamiMetricsWithTrend {
  pageviews: number;
  visitors: number;
  visits: number;
  bounceRate: number;
  avgDuration: number;
  pagesPerSession: number;
  breakdown: UmamiBreakdownMetrics;
  trends: {
    pageviews: number;
    visitors: number;
    bounceRate: number;
    avgDuration: number;
    pagesPerSession: number;
  };
}

export interface IUmamiRepository {
  saveSnapshot(projectId: string, data: UmamiDashboardData): Promise<void>;
  getSnapshotAt(
    projectId: string,
    date: Date
  ): Promise<UmamiSnapshotEntity | null>;
  getLatestSnapshot(projectId: string): Promise<UmamiSnapshotEntity | null>;
  getHistory(projectId: string, limit?: number): Promise<UmamiSnapshotEntity[]>;
}
