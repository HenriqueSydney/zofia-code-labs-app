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

type GetIntegrationParams = {
  organizationId: string;
  type: IntegrationType;
  contextOptions?: any; // Novo parâmetro para contexto (owner/repo)
  providedSecrets?: Record<string, string>;
};
// Definição do tipo para a função que cria a instância
type IntegrationCreator = (
  secrets: Record<string, string>,
  options?: any
) => any;

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

  [IntegrationType.GITHUB]: (secrets, options) =>
    new GitHubService({
      personalToken: secrets["GITHUB_ACCESS_TOKEN"],
      orgName: secrets["GITHUB_ORG_NAME"],
      owner: options?.owner,
      repo: options?.repo,
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

  async getServiceSecret(organizationId: string, type: IntegrationType) {
    const path = `/${organizationId}/integrations/${type}`;
    const secrets = await this.infisical.getAllSecrets({
      workspaceId: process.env.INFISICAL_WORKSPACE_ID!,
      environment: process.env.NODE_ENV === "production" ? "prod" : "dev",
      path,
    });

    if (!secrets || Object.keys(secrets).length === 0) {
      throw new Error(
        `Nenhum segredo encontrado para a integração ${type} no path ${path}`
      );
    }

    return secrets;
  }

  async getIntegration<T>({
    organizationId,
    type,
    contextOptions,
    providedSecrets,
  }: GetIntegrationParams): Promise<T> {
    let finalSecrets: Record<string, string>;

    if (!providedSecrets) {
      finalSecrets = await this.getServiceSecret(organizationId, type);
    } else {
      finalSecrets = providedSecrets;
    }

    // O cache agora precisa levar em conta o contexto (owner/repo)
    // para não retornar o serviço do Projeto A para o Projeto B
    const contextHash = contextOptions ? JSON.stringify(contextOptions) : "";
    const secretsHash = JSON.stringify(finalSecrets);
    const cacheKey = `${organizationId}:${type}:${contextHash}`;

    const cached = IntegrationFactory.cache.get(cacheKey);
    if (cached && cached.secretsHash === secretsHash) {
      return cached.instance as T;
    }

    const createInstance = INTEGRATION_STRATEGIES[type];
    if (!createInstance) {
      throw new Error(`Estratégia não definida para: ${type}`);
    }

    // Passamos finalSecrets e o contexto para o criador
    const instance = createInstance(finalSecrets, contextOptions);

    IntegrationFactory.cache.set(cacheKey, {
      instance,
      secretsHash,
    });

    return instance as T;
  }
}
