import { handleErrors } from "@/errors/handleErrors";
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

    if (!response.ok) throw new Error("Falha na autenticação com Infisical");

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
      const error = await response.text();
      throw new Error(`[Infisical Error] ${response.status}: ${error}`);
    }

    return response.json();
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
    const workspaceId =
      options?.workspaceId ?? process.env.INFISICAL_WORKSPACE_ID!;
    const environment =
      options?.environment ??
      (process.env.NODE_ENV === "production" ? "prod" : "dev");

    // Extrai o nome da última pasta do path
    // Ex: /org123/integrations/stripe -> name = "stripe"
    const pathParts = path.split("/").filter(Boolean);
    const folderName = pathParts.pop();

    // O diretório pai é o que sobra
    // Ex: /org123/integrations/stripe -> parentPath = "/org123/integrations"
    const parentPath = "/" + pathParts.join("/");

    if (!folderName) return;

    try {
      await this.request(`/v1/folders`, {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          environment,
          name: folderName, // O campo que estava faltando!
          path: parentPath, // Onde a pasta será criada
        }),
      });
    } catch (error: any) {
      handleErrors(error);
      console.log(
        `[Infisical] Info: Pasta ${path} já existe ou não pôde ser criada.`
      );
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
      // 1. Tenta criar o segredo (POST)
      await this.request(`/v3/secrets/raw/${key}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      /**
       * 2. Verifica se o erro é de segredo já existente.
       * O Infisical retorna 400 com a mensagem "Secret already exists"
       */
      const errorMessage = error.message || "";
      const isAlreadyExists =
        errorMessage.includes("Secret already exists") ||
        (error.response &&
          JSON.stringify(error.response).includes("Secret already exists"));

      if (isAlreadyExists) {
        // 3. Se já existir, tenta atualizar (PATCH)
        await this.request(`/v3/secrets/raw/${key}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        // Se for outro erro (401, 403, 500), propaga para o Use Case
        throw error;
      }
    }
  }
}
