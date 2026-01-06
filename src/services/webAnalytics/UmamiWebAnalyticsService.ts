import { IntegrationBase } from "../IntegrationBase";
import { AnalyticsStats, IWebAnalyticsService } from "./IWebAnalyticsService";

export class UmamiWebAnalyticsService
  extends IntegrationBase
  implements IWebAnalyticsService
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

    const url = `${this.baseUrl}${endpoint}`;
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

    const response = await fetch(`${this.baseUrl}/auth/login`, {
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
    return this.request<AnalyticsStats>(
      `/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`
    );
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
}
