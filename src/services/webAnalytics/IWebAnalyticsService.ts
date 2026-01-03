export interface AnalyticsStats {
  pageviews: { value: number; change: number };
  visitors: { value: number; change: number };
  visits: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

export interface IWebAnalyticsService {
  getWebsiteStats(websiteId: string, startAt: number, endAt: number): Promise<AnalyticsStats>;
  createWebsite(name: string, domain: string, enableShare?: boolean): Promise<any>;
  createUser(username: string, password: string, role?: 'admin' | 'user'): Promise<any>;
  createTeam(name: string): Promise<any>;
  assignTeamToWebsites(teamId: string, websiteIds: string[]): Promise<void>;
  addMemberToTeam(teamId: string, userId: string, role?: 'member' | 'admin'): Promise<void>;
}