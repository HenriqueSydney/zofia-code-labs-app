import { ExternalServiceError } from "@/errors";
import { IntegrationBase } from "../IntegrationBase";
import {
  IProjectLinkable,
  SetupProjectParams,
  SetupProjectResult,
} from "../IProjectLinkable";
import {
  AnalyticsStats,
  IWebAnalyticsService,
  RealtimeVisitor,
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
      throw new ExternalServiceError("Umami API Error", "${response.status} - ${JSON.stringify(errorData)}");
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

    if (!response.ok) throw new ExternalServiceError("Umami", "Falha na autenticação com Umami");

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
    return items.map((item) => {
      // Garantir que os valores numéricos sejam números, pois o Umami às vezes envia strings
      const pageviews = Number(item.pageviews || 0);
      const totalTime = Number(item.totaltime || item.totalTime || 0);
      const visitors = Number(item.visitors || item.value || 0);
      const bounces = Number(item.bounces || 0);

      return {
        name:
          item.x ||
          item.browser ||
          item.os ||
          item.device ||
          item.country ||
          item.name ||
          "Unknown",
        value: visitors,
        pageviews: pageviews,
        bounces: bounces,
        totalTime: totalTime,
        // Cálculo do tempo médio por página nesta métrica específica
        avgTime: pageviews > 0 ? Number((totalTime / pageviews).toFixed(2)) : 0,
      };
    });
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

    const metricTypes = [
      "path",
      "browser", // O Umami usa 'browser' no singular para o parâmetro type
      "os",
      "device", // O Umami usa 'device' no singular para o parâmetro type
      "country", // O Umami usa 'country' no singular para o parâmetro type
      "referrer",
    ] as const;

    // 2. Executa todas as chamadas em paralelo
    const [stats, metricsResults, history, hourlyHistory] = await Promise.all([
      this.getWebsiteStats(websiteId, startAt, endAt),

      // Mapeia os tipos de métricas para requests
      Promise.all(
        metricTypes.map((type) =>
          this.request<any[]>(
            `/websites/${websiteId}/metrics/expanded?type=${type}&startAt=${startAt}&endAt=${endAt}`
          )
        )
      ),

      this.request<UmamiHistoryResponse>(
        `/websites/${websiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=${timezone}`
      ),

      this.request<UmamiHistoryResponse>(
        `/websites/${websiteId}/pageviews?startAt=${beginOfTheLast24Hours}&endAt=${endAt}&unit=hour&timezone=${timezone}`
      ),
    ]);

    // 3. Transforma o array de resultados em um objeto mapeado para facilitar o acesso
    const breakdownData = metricTypes.reduce((acc, type, index) => {
      acc[type] = this.mapMetric(metricsResults[index]);
      return acc;
    }, {} as Record<string, any>);

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
        pages: breakdownData.path,
        browsers: breakdownData.browser,
        os: breakdownData.os,
        devices: breakdownData.device,
        countries: breakdownData.country,
        referrers: breakdownData.referrer,
        history: history,
        hourlyHistory,
      },
      timestamp: new Date(),
    };
  }

  async getRealtimeMetrics(websiteId: string): Promise<RealtimeVisitor[]> {
    const rawData = await this.request<any>(`/realtime/${websiteId}`);

    if (!rawData || !rawData.urls) {
      return [];
    }

    // Tipamos o acumulador explicitamente como um Record de strings para RealtimeVisitor
    const grouping = Object.entries(rawData.urls).map(([page, visitors]) => {
      return {
        page,
        visitors: visitors as number,
      };
    });

    // Agora o TS sabe que Object.values retorna RealtimeVisitor[]
    return Object.values(grouping).sort((a, b) => b.visitors - a.visitors);
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

  async setupProject<T>(
    params: SetupProjectParams<T>
  ): Promise<SetupProjectResult> {
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
