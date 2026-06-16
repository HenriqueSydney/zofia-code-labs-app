import https from "https";
import { IntegrationBase } from "../../IntegrationBase";
import {
  IPaymentGatewayService,
  InterConfig,
  PaymentMethods,
  SubscriptionPlan,
  GatewayFees,
  PaymentIntentResult,
  CustomerResult,
} from "../IPaymentGatewayService";

interface InterToken {
  access_token: string;
  expires_at: number; // timestamp ms
}

export class InterError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "InterError";
  }
}

export class InterService
  extends IntegrationBase
  implements IPaymentGatewayService
{
  private baseUrl: string;
  private config: InterConfig;
  private tokenCache: InterToken | null = null;

  // Agent mTLS reutilizado entre requests
  private httpsAgent: https.Agent;

  constructor(config: InterConfig) {
    super("inter");
    this.config = config;
    this.baseUrl = config.sandbox
      ? "https://cdpj.partners.bancointer.com.br/sandbox"
      : "https://cdpj.partners.bancointer.com.br";

    // mTLS: certificado + chave privada vindos do Infisical
    this.httpsAgent = new https.Agent({
      cert: config.certPem,
      key: config.keyPem,
      rejectUnauthorized: true,
    });
  }

  // ------------------------------------------------------------------
  // Auth — OAuth 2.0 client_credentials com cache de token
  // ------------------------------------------------------------------

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.tokenCache && this.tokenCache.expires_at > now + 30_000) {
      return this.tokenCache.access_token;
    }

    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "client_credentials",
      scope:
        "boleto-cobranca.write boleto-cobranca.read pix-pagamento.write pix-pagamento.read extrato.read",
    });

    const response = await fetch(`${this.baseUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      // @ts-expect-error — Node 18 fetch aceita agent via undici dispatcher; use node-fetch se necessário
      agent: this.httpsAgent,
    });

    const json = (await response.json()) as any;

    if (!response.ok) {
      throw new InterError(
        `Falha de autenticação Inter: ${json.error_description}`,
        response.status,
      );
    }

    this.tokenCache = {
      access_token: json.access_token,
      expires_at: now + json.expires_in * 1000,
    };

    return this.tokenCache.access_token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      // @ts-expect-error
      agent: this.httpsAgent,
    });

    const json = (await response.json()) as any;

    if (!response.ok) {
      throw new InterError(json.message ?? "Erro Inter API", response.status);
    }

    return json as T;
  }

  // ------------------------------------------------------------------
  // Health
  // ------------------------------------------------------------------

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      await this.getAccessToken();
      return { status: "up", latency: Math.round(performance.now() - start) };
    } catch {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  // ------------------------------------------------------------------
  // Customer — Inter não tem conceito de customer, igual ao MP
  // ------------------------------------------------------------------

  async createCustomer(
    email: string,
    name: string,
    _organizationId?: string,
  ): Promise<CustomerResult> {
    return {
      gatewayCustomerId: null,
      email: email,
      name: name,
      gateway: "inter",
      raw: null,
    };
  }

  // ------------------------------------------------------------------
  // Cobrança (Boleto + Pix)
  // ------------------------------------------------------------------

  async createCheckoutSession(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    return this.createPaymentIntent(data);
  }

  /**
   * Cria uma cobrança no Inter.
   * Para Pix: usa a API de Pix Cobrança (cob).
   * Para Boleto: usa a API de Boleto Cobrança.
   */
  async createPaymentIntent(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    const types = Array.isArray(data.type) ? data.type : [data.type];
    const primaryType = types[0];

    if (primaryType === "pix") {
      return this.createPixCharge(data);
    }

    return this.createBoletoCharge(data);
  }

  private async createPixCharge(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    const txid = data.invoiceId.replace(/-/g, "").substring(0, 35); // Inter limita txid

    const result = await this.request<any>("PUT", `/pix/v2/cob/${txid}`, {
      calendario: { expiracao: 86400 }, // 24h
      valor: { original: (data.amount / 100).toFixed(2) },
      chave: this.config.pixKey,
      solicitacaoPagador: data.description ?? "",
      infoAdicionais: [
        { nome: "invoiceId", valor: data.invoiceId },
        { nome: "organizationId", valor: data.organizationId },
      ],
    });

    return {
      id: result.txid,
      clientSecret: result.pixCopiaECola ?? "",
      status: result.status?.toLowerCase() ?? "pending",
      amount: data.amount,
      currency: "brl",
    };
  }

  private async createBoletoCharge(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // vencimento em 3 dias

    const result = await this.request<any>("POST", "/cobranca/v3/cobrancas", {
      seuNumero: data.invoiceId.substring(0, 15), // Inter limita a 15 chars
      valorNominal: (data.amount / 100).toFixed(2),
      dataVencimento: dueDate.toISOString().split("T")[0],
      numDiasAgenda: 60,
      pagador: {
        email: data.customerEmail,
        ddd: data.payer?.ddd,
        telefone: data.payer?.phone,
        numero: data.payer?.addressNumber,
        complemento: data.payer?.complement,
        nome: data.payer?.name,
        endereco: data.payer?.address,
        bairro: data.payer?.neighborhood,
        cidade: data.payer?.city,
        uf: data.payer?.state,
        cep: data.payer?.zipCode,
        cnpjCpf: data.payer?.document,
        tipoPessoa: data.payer?.personType ?? "FISICA",
      },
      mensagem: {
        linha1: data.description ?? "",
      },
    });

    return {
      id: result.codigoSolicitacao,
      clientSecret: result.linhaDigitavel ?? "",
      status: "pending",
      amount: data.amount,
      currency: "brl",
    };
  }

  // ------------------------------------------------------------------
  // Assinatura — Inter não tem billing nativo; não suportado
  // ------------------------------------------------------------------

  async createSubscription(_data: SubscriptionPlan): Promise<any> {
    throw new InterError(
      "Inter não suporta assinaturas recorrentes nativas. Use Stripe para este caso.",
    );
  }

  async cancelSubscription(_subscriptionId: string): Promise<any> {
    throw new InterError("Inter não suporta assinaturas recorrentes nativas.");
  }

  async getCurrentFees(): Promise<GatewayFees> {
    // Taxas contratuais Inter — atualizar conforme contrato
    return {
      card_percentage: 0,
      card_fixed: 0,
      pix_percentage: 0, // Inter PJ pode ter Pix gratuito
      pix_fixed: 0,
      boleto_fixed: 2.5,
    };
  }
}
