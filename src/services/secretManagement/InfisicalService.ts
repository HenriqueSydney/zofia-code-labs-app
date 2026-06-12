import { AppError, ExternalServiceError } from "@/errors";
import { IntegrationBase } from "../IntegrationBase";
import {
  ISecretManagementService,
  SecretOptions,
} from "./ISecretManagementService";

export class InfisicalService
  extends IntegrationBase
  implements ISecretManagementService
{
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    super("infisical");
    this.baseUrl = (
      process.env.INFISICAL_URL || "http://localhost:8081/api"
    ).replace(/\/$/, "");
    this.clientId = process.env.INFISICAL_CLIENT_ID || "";
    this.clientSecret = process.env.INFISICAL_CLIENT_SECRET || "";
  }

  /**
   * Verifica se a API do Infisical está acessível e se as credenciais são válidas
   */
  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      await this.authenticate(); // Força a renovação do token se necessário
      const response = await fetch(`${this.baseUrl}/v1/auth/token-data`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      return {
        status: response.ok ? "up" : "down",
        latency: Math.round(performance.now() - start),
      };
    } catch {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  /**
   * Autenticação via Universal Auth (Machine Identity)
   */
  private async authenticate(): Promise<void> {
    const now = Date.now();
    // Se o token existe e ainda é válido por pelo menos 1 minuto, não renova
    if (this.accessToken && this.tokenExpiry > now + 60000) return;

    const response = await fetch(
      `${this.baseUrl}/v1/auth/universal-auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        }),
      }
    );

    if (!response.ok) throw new ExternalServiceError("Infisical", "Falha na autenticação com Infisical");

    const data = await response.json();
    this.accessToken = data.accessToken;
    // Infisical geralmente retorna expires_in em segundos
    this.tokenExpiry = now + data.expiresIn * 1000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ExternalServiceError("Infisical", {
        status: response.status,
        body: errorBody,
      });
    }

    return response.json();
  }

  private isAlreadyExistsError(error: unknown): boolean {
    if (!(error instanceof AppError)) return false;

    const message = error.message.toLowerCase();
    return (
      message.includes("already exists") ||
      message.includes("já existe") ||
      message.includes("duplicate")
    );
  }

  async getSecret(key: string, options: SecretOptions): Promise<string> {
    const workspaceId =
      options?.workspaceId ?? process.env.INFISICAL_WORKSPACE_ID!;
    const environment =
      options?.environment ??
      (process.env.NODE_ENV === "production" ? "prod" : "dev");
    const params = new URLSearchParams({
      workspaceId,
      environment,
      secretPath: options.path || "/",
      type: "shared",
    });

    const data: any = await this.request(`/v3/secrets/raw/${key}?${params}`);
    return data.secret.secretValue;
  }

  async getAllSecrets(options: SecretOptions): Promise<Record<string, string>> {
    const workspaceId =
      options?.workspaceId ?? process.env.INFISICAL_WORKSPACE_ID!;
    const environment =
      options?.environment ??
      (process.env.NODE_ENV === "production" ? "prod" : "dev");
    const params = new URLSearchParams({
      workspaceId,
      environment,
      secretPath: options.path || "/",
      include_imports: "true",
    });

    const data: any = await this.request(`/v3/secrets/raw?${params}`);
    const secrets: Record<string, string> = {};

    data.secrets.forEach((s: any) => {
      secrets[s.secretKey] = s.secretValue;
    });

    return secrets;
  }

  async createFolder(path: string, options?: SecretOptions): Promise<void> {
    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length === 0) return;

    // Garante cada segmento do path, criando pais antes dos filhos
    let currentPath = "";
    for (const segment of pathParts) {
      currentPath += `/${segment}`;
      await this.ensureFolderSegment(currentPath, options);
    }
  }

  private async ensureFolderSegment(
    path: string,
    options?: SecretOptions
  ): Promise<void> {
    const workspaceId =
      options?.workspaceId ?? process.env.INFISICAL_WORKSPACE_ID!;
    const environment =
      options?.environment ??
      (process.env.NODE_ENV === "production" ? "prod" : "dev");

    const pathParts = path.split("/").filter(Boolean);
    const folderName = pathParts.pop();
    const parentPath = "/" + pathParts.join("/");

    if (!folderName) return;

    try {
      await this.request(`/v1/folders`, {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          environment,
          name: folderName,
          path: parentPath,
        }),
      });
    } catch (error: unknown) {
      if (this.isAlreadyExistsError(error)) return;
      throw error;
    }
  }

  async upsertSecret(
    key: string,
    value: string,
    options?: SecretOptions
  ): Promise<void> {
    const workspaceId =
      options?.workspaceId ?? process.env.INFISICAL_WORKSPACE_ID!;
    const environment =
      options?.environment ??
      (process.env.NODE_ENV === "production" ? "prod" : "dev");

    const payload = {
      workspaceId,
      environment,
      secretPath: options?.path || "/",
      secretValue: value,
      secretComment: "Atualizado via ERP Core",
    };

    try {
      await this.request(`/v3/secrets/raw/${key}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error: unknown) {
      if (!this.isAlreadyExistsError(error)) throw error;

      await this.request(`/v3/secrets/raw/${key}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    }
  }
}
