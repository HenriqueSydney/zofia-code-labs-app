import { prisma } from "@/lib/prisma";
import { IntegrationBase } from "../IntegrationBase";
import {
  IProjectLinkable,
  SetupProjectParams,
  SetupProjectResult,
} from "../IProjectLinkable";
import {
  AnalyticsStats,
  GetCompleteAnalytics,
  IWebAnalyticsService,
  UmamiExpandedMetric,
  UmamiHistoryResponse,
  UmamiRawStatsResponse,
} from "./IWebAnalyticsService";
import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { date } from "@/lib/dayjs";

export class UmamiWebAnalyticsService
  extends IntegrationBase
  implements IWebAnalyticsService, IProjectLinkable
{
  private baseUrl: string;
  private token: string | null = null;
  private username: string | null = null;
  private password: string | null = null;

  constructor(config: { baseUrl: string; username: string; password: string }) {
    super("umami-analytics");

    this.baseUrl = (
      config.baseUrl ||
      process.env.UMAMI_API_URL ||
      "http://umami:3000/api"
    ).replace(/\/$/, "");
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * Verifica a conectividade com a API do Umami
   */
  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // O Umami possui um endpoint de heartbeat ou podemos testar a própria base
      const response = await fetch(`${this.baseUrl}/heartbeat`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // Timeout de 5s para não travar o ERP
      });

      const end = performance.now();
      const latency = Math.round(end - start);

      return {
        status: response.ok ? "up" : "down",
        latency,
      };
    } catch (error) {
      const end = performance.now();
      return {
        status: "down",
        latency: Math.round(end - start),
      };
    }
  }

  /**
   * Helper privado para chamadas fetch com autenticação e tratamento de erros
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.authenticate();

    const url = `${this.baseUrl}/api${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `[Umami API Error] ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    return response.json() as Promise<T>;
  }

  private async authenticate(): Promise<void> {
    if (this.token) return;

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    });

    if (!response.ok) throw new Error("Falha na autenticação com Umami");

    const data = await response.json();
    this.token = data.token;
  }

  async getWebsiteStats(
    websiteId: string,
    startAt: number,
    endAt: number
  ): Promise<AnalyticsStats> {
    const raw = await this.request<UmamiRawStatsResponse>(
      `/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`
    );

    const calculateChange = (current: number, prev: number) => {
      if (prev === 0) return 0;
      return Math.round(((current - prev) / prev) * 100);
    };

    // Cálculos de Taxa de Rejeição (Bounce Rate)
    const currentBounceRate =
      raw.visits > 0 ? (raw.bounces / raw.visits) * 100 : 0;
    const prevBounceRate =
      raw.comparison.visits > 0
        ? (raw.comparison.bounces / raw.comparison.visits) * 100
        : 0;

    // Cálculos de Duração Média (Avg Duration)
    const currentAvgDuration = raw.visits > 0 ? raw.totaltime / raw.visits : 0;
    const prevAvgDuration =
      raw.comparison.visits > 0
        ? raw.comparison.totaltime / raw.comparison.visits
        : 0;

    return {
      pageviews: {
        value: raw.pageviews,
        change: calculateChange(raw.pageviews, raw.comparison.pageviews),
      },
      visitors: {
        value: raw.visitors,
        change: calculateChange(raw.visitors, raw.comparison.visitors),
      },
      visits: {
        value: raw.visits,
        change: calculateChange(raw.visits, raw.comparison.visits),
      },
      bounceRate: {
        value: Number(currentBounceRate.toFixed(2)),
        change: calculateChange(currentBounceRate, prevBounceRate),
      },
      avgDuration: {
        value: Math.round(currentAvgDuration),
        change: calculateChange(currentAvgDuration, prevAvgDuration),
      },
    };
  }

  private mapMetric(items: any[]) {
    return items.map((item) => ({
      // O Umami retorna a chave com o nome do tipo (ex: item.browser, item.os, item.device)
      // Se não encontrar, tenta 'x' ou o primeiro valor que não seja métrica numérica
      name:
        item.x ||
        item.browser ||
        item.os ||
        item.device ||
        item.country ||
        item.name ||
        "Unknown",
      value: item.visitors || 0,
      pageviews: item.pageviews || 0,
    }));
  }

  async getCompleteAnalytics(
    websiteId: string,
    startAt: number,
    endAt: number,
    timezone = "America/Sao_Paulo"
  ) {
    const beginOfTheLast24Hours = date(endAt)
      .subtract(24, "hours")
      .startOf("hour")
      .valueOf();

    const [stats, browsers, os, devices, countries, history, hourlyHistory] =
      await Promise.all([
        this.getWebsiteStats(websiteId, startAt, endAt),
        this.request<any[]>(
          `/websites/${websiteId}/metrics?type=browser&startAt=${startAt}&endAt=${endAt}`
        ),
        this.request<any[]>(
          `/websites/${websiteId}/metrics?type=os&startAt=${startAt}&endAt=${endAt}`
        ),
        this.request<any[]>(
          `/websites/${websiteId}/metrics?type=device&startAt=${startAt}&endAt=${endAt}`
        ),
        this.request<any[]>(
          `/websites/${websiteId}/metrics?type=country&startAt=${startAt}&endAt=${endAt}`
        ),
        this.request<UmamiHistoryResponse>(
          `/websites/${websiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=${timezone}`
        ),
        this.request<UmamiHistoryResponse>(
          `/websites/${websiteId}/pageviews?startAt=${beginOfTheLast24Hours}&endAt=${endAt}&unit=hour&timezone=${timezone}`
        ),
      ]);

    console.log(hourlyHistory);

    return {
      pageviews: stats.pageviews.value,
      visitors: stats.visitors.value,
      visits: stats.visits.value,
      bounceRate: stats.bounceRate.value,
      avgDuration: stats.avgDuration.value,
      pagesPerSession:
        stats.visits.value > 0
          ? Number((stats.pageviews.value / stats.visits.value).toFixed(2))
          : 0,

      breakdown: {
        browsers: this.mapMetric(browsers),
        os: this.mapMetric(os),
        devices: this.mapMetric(devices),
        countries: this.mapMetric(countries),
        history: history,
        hourlyHistory,
      },
      timestamp: new Date(),
    };
  }

  async createWebsite(
    name: string,
    domain: string,
    enableShare: boolean = true
  ): Promise<any> {
    return this.request("/websites", {
      method: "POST",
      body: JSON.stringify({
        name,
        domain,
        shareId: enableShare ? crypto.randomUUID() : null,
      }),
    });
  }

  async createUser(
    username: string,
    password: string,
    role: "admin" | "user" = "user"
  ): Promise<any> {
    return this.request("/admin/users", {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    });
  }

  async createTeam(name: string): Promise<any> {
    return this.request("/teams", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async assignTeamToWebsites(
    teamId: string,
    websiteIds: string[]
  ): Promise<void> {
    // O Umami associa enviando requisições individuais por site
    for (const websiteId of websiteIds) {
      await this.request(`/teams/${teamId}/websites`, {
        method: "POST",
        body: JSON.stringify({ websiteId }),
      });
    }
  }

  async addMemberToTeam(
    teamId: string,
    userId: string,
    role: "member" | "admin" = "member"
  ): Promise<void> {
    await this.request(`/teams/${teamId}/users`, {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    });
  }

  async setupProject(params: SetupProjectParams): Promise<SetupProjectResult> {
    const projectRepository = makeProjectRepository();
    const project = await projectRepository.findBySlug(params.projectSlug);
    const domain = "clinicaacolhekids.com.br";
    const websiteResult = await this.createWebsite(params.projectName, domain);

    return {
      externalId: websiteResult.id,
      metadata: {
        website: websiteResult,
      },
    };
  }
}
