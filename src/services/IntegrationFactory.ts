import { SonarQubeService } from "./codeQuality/SonarQubeService";
import { ResendEmailService } from "./email/implementations/IResendService";
import { GitHubService } from "./git/implementations/GitHubService";
import { CoraService } from "./paymentGateway/implementations/CoraService";
import { MercadoPagoService } from "./paymentGateway/implementations/MercadoPagoService";
import { StripeService } from "./paymentGateway/implementations/StripeService";
import { InfisicalService } from "./secretManagement/InfisicalService";
import { ISecretManagementService } from "./secretManagement/ISecretManagementService";
import { DefectDojoService } from "./security/DefectDojoService";
import { UmamiWebAnalyticsService } from "./webAnalytics/UmamiWebAnalyticsService";

export enum IntegrationType {
  STRIPE = "stripe",
  MERCADO_PAGO = "mercado-pago",
  CORA = "cora-payment",
  SONARQUBE = "sonarqube",
  DEFECTDOJO = "defectdojo",
  UMAMI = "umami-analytics",
  GITHUB = "github",
  RESEND = "resend",
}

// Definição do tipo para a função que cria a instância
type IntegrationCreator = (secrets: Record<string, string>) => any;

// Mapa de estratégias de criação
const INTEGRATION_STRATEGIES: Record<IntegrationType, IntegrationCreator> = {
  [IntegrationType.STRIPE]: (secrets) =>
    new StripeService({
      apiKey: secrets["STRIPE_SECRET_KEY"],
    }),

  [IntegrationType.MERCADO_PAGO]: (secrets) =>
    new MercadoPagoService({
      accessToken: secrets["MP_ACCESS_TOKEN"],
    }),

  [IntegrationType.SONARQUBE]: (secrets) =>
    new SonarQubeService({
      baseUrl: secrets["SONARQUBE_URL"],
      token: secrets["SONARQUBE_TOKEN"],
    }),

  [IntegrationType.CORA]: (secrets) =>
    new CoraService({
      clientId: secrets["CORA_CLIENT_ID"],
      clientSecret: secrets["CORA_CLIENT_SECRET"],
    }),

  [IntegrationType.DEFECTDOJO]: (secrets) =>
    new DefectDojoService({
      baseUrl: secrets["DEFECTDOJO_URL"],
      apiKey: secrets["DEFECTDOJO_API_KEY"],
    }),

  [IntegrationType.UMAMI]: (secrets) =>
    new UmamiWebAnalyticsService({
      baseUrl: secrets["UMAMI_API_URL"],
      username: secrets["UMAMI_ADMIN_USER"],
      password: secrets["UMAMI_ADMIN_PASSWORD"],
    }),

  [IntegrationType.GITHUB]: (secrets) =>
    new GitHubService({
      personalToken: secrets["GITHUB_ACCESS_TOKEN"],
      orgName: secrets["GITHUB_ORG_NAME"],
    }),

  [IntegrationType.RESEND]: (secrets) =>
    new ResendEmailService({
      apiKey: secrets["RESEND_API_KEY"],
      fromEmail: secrets["RESEND_FROM_EMAIL"],
    }),
};

export class IntegrationFactory {
  private infisical: ISecretManagementService;
  private static cache = new Map<
    string,
    { instance: any; secretsHash: string }
  >();

  constructor(infisicalService?: ISecretManagementService) {
    // Caso não receba, instancia o padrão (útil para rotinas automáticas)
    this.infisical = infisicalService || new InfisicalService();
  }

  async getIntegration<T>(
    organizationId: string,
    type: IntegrationType,
    providedSecrets?: Record<string, string>
  ): Promise<T> {
    let finalSecrets: Record<string, string>;

    // 1. Lógica de Fallback: Se não passou secrets, busca no Infisical
    if (!providedSecrets) {
      const path = `/${organizationId}/integrations/${type}`;
      finalSecrets = await this.infisical.getAllSecrets({
        workspaceId: process.env.INFISICAL_WORKSPACE_ID!,
        environment: process.env.NODE_ENV === "production" ? "prod" : "dev",
        path,
      });

      if (!finalSecrets || Object.keys(finalSecrets).length === 0) {
        throw new Error(
          `Nenhum segredo encontrado para a integração ${type} no path ${path}`
        );
      }
    } else {
      // Se passou, usa as repassadas
      finalSecrets = providedSecrets;
    }

    // 2. Validação de Cache via Hash (evita instanciar o que já está pronto e igual)
    const secretsHash = JSON.stringify(finalSecrets);
    const cacheKey = `${organizationId}:${type}`;
    const cached = IntegrationFactory.cache.get(cacheKey);

    if (cached && cached.secretsHash === secretsHash) {
      return cached.instance as T;
    }

    // 3. Estratégia de Criação
    const createInstance = INTEGRATION_STRATEGIES[type];
    if (!createInstance) {
      throw new Error(`Estratégia não definida para: ${type}`);
    }

    const instance = createInstance(finalSecrets);

    // 4. Atualiza Cache
    IntegrationFactory.cache.set(cacheKey, {
      instance,
      secretsHash,
    });

    return instance as T;
  }
}
