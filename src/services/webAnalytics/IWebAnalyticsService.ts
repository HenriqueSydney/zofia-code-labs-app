export interface UmamiRawStatsResponse {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  comparison: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
}

export interface AnalyticsStats {
  pageviews: { value: number; change: number };
  visitors: { value: number; change: number };
  visits: { value: number; change: number };
  bounceRate: { value: number; change: number };
  avgDuration: { value: number; change: number };
}

export type UmamiExpandedMetric = {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
};

interface UmamiExpandedMetricWithAvgTime {
  name: any;
  value: number;
  pageviews: number;
  bounces: number;
  totalTime: number;
  avgTime: number;
}

export type UmamiHistoryResponse = {
  pageviews: { x: string; y: number }[];
  sessions: { x: string; y: number }[];
};

export type UmamiBreakdownMetrics = {
  browsers: UmamiExpandedMetricWithAvgTime[];
  os: UmamiExpandedMetricWithAvgTime[];
  devices: UmamiExpandedMetricWithAvgTime[];
  countries: UmamiExpandedMetricWithAvgTime[];
  pages: UmamiExpandedMetricWithAvgTime[];
  referrers: UmamiExpandedMetricWithAvgTime[];
  history: UmamiHistoryResponse;
  hourlyHistory: UmamiHistoryResponse;
};

export type GetCompleteAnalytics = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounceRate: number;
  avgDuration: number;
  pagesPerSession: number;
  breakdown: UmamiBreakdownMetrics;
  timestamp: Date;
};

export interface RealtimeVisitor {
  page: string;
  visitors: number;
}

export interface IWebAnalyticsService {
  getWebsiteStats(
    websiteId: string,
    startAt: number,
    endAt: number
  ): Promise<AnalyticsStats>;
  createWebsite(
    name: string,
    domain: string,
    enableShare?: boolean
  ): Promise<any>;
  createUser(
    username: string,
    password: string,
    role?: "admin" | "user"
  ): Promise<any>;
  createTeam(name: string): Promise<any>;
  assignTeamToWebsites(teamId: string, websiteIds: string[]): Promise<void>;
  addMemberToTeam(
    teamId: string,
    userId: string,
    role?: "member" | "admin"
  ): Promise<void>;

  getCompleteAnalytics(
    websiteId: string,
    startAt: number,
    endAt: number,
    timezone: string
  ): Promise<GetCompleteAnalytics>;
  getRealtimeMetrics(websiteId: string): Promise<RealtimeVisitor[]>;
}
