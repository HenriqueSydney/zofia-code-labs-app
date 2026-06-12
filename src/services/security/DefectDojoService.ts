import { ExternalServiceError } from "@/errors";
import { IntegrationBase } from "../IntegrationBase";
import { ISecurityService, SecurityMetrics } from "./ISecurityService";

export class DefectDojoService
  extends IntegrationBase
  implements ISecurityService
{
  private baseUrl: string;
  private defectApiKey: string;

  constructor(config: { baseUrl: string; apiKey: string }) {
    super("defectdojo");
    this.baseUrl = (
      config.baseUrl ||
      process.env.DEFECTDOJO_URL ||
      "http://defectdojo:8080/api/v2"
    ).replace(/\/$/, "");
    this.defectApiKey = config.apiKey;
  }

  /**
   * Verifica a saúde da API do DefectDojo
   */
  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // O endpoint de "users/self" é leve e confirma se o token é válido
      const response = await fetch(`${this.baseUrl}/users/self/`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      const end = performance.now();
      return {
        status: response.ok ? "up" : "down",
        latency: Math.round(end - start),
      };
    } catch (error) {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Token ${this.defectApiKey}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalServiceError("DefectDojo Error", "${response.status}: ${errorText}");
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  async createProduct(
    name: string,
    description: string,
    productType: number = 1
  ): Promise<any> {
    return this.request("/products/", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        prod_type: productType, // ID do tipo de produto (ex: Web App)
      }),
    });
  }

  async getProductMetrics(
    productId: string | number
  ): Promise<SecurityMetrics> {
    // Buscamos apenas os findings ativos e verificados do produto específico
    const params = new URLSearchParams({
      project: String(productId),
      active: "true",
      duplicate: "false",
      limit: "1", // Só queremos o count total inicial da API
    });

    // O DefectDojo retorna a contagem total no campo 'count' de cada query filtrada
    // Para um dashboard ERP real, o ideal é usar o endpoint /finding/stats
    const data: any = await this.request(
      `/products/${productId}/generate_report/`,
      {
        method: "GET",
      }
    );

    // Simplificando: o Dojo tem um endpoint de estatísticas por produto
    const stats: any = await this.request(`/products/${productId}/stats/`);

    return {
      critical: stats.critical || 0,
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
      info: stats.info || 0,
      totalActive: stats.critical + stats.high + stats.medium + stats.low || 0,
    };
  }

  async createEngagement(
    productId: number,
    name: string,
    leadId: number
  ): Promise<any> {
    // Engajamento é o "container" para os scans de um período ou release
    return this.request("/engagements/", {
      method: "POST",
      body: JSON.stringify({
        name,
        product: productId,
        lead: leadId, // ID do usuário responsável
        status: "In Progress",
        engagement_type: "Interactive",
        target_start: new Date().toISOString().split("T")[0],
        target_end: new Date().toISOString().split("T")[0],
      }),
    });
  }

  async createUser(
    username: string,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<any> {
    return this.request("/users/", {
      method: "POST",
      body: JSON.stringify({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        is_active: true,
      }),
    });
  }

  async addUsertoProduct(
    productId: number,
    userId: number,
    roleName: string = "View"
  ): Promise<void> {
    // No Dojo v2, associamos via Product_API_Scan_Configuration ou Product_Member
    await this.request("/product_members/", {
      method: "POST",
      body: JSON.stringify({
        product: productId,
        user: userId,
        role: roleName, // Ex: Owner, Maintainer, View
      }),
    });
  }
}
