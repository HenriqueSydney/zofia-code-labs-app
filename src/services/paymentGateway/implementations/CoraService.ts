import { IntegrationBase } from "../../IntegrationBase";
import {
  IPaymentGatewayService,
  PaymentMethods,
  SubscriptionPlan,
} from "../IPaymentGatewayService";

export class CoraService
  extends IntegrationBase
  implements IPaymentGatewayService
{
  private baseUrl: string = "https://api.cora.com.br";
  private token: string | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;

  constructor({
    clientId,
    clientSecret,
  }: {
    clientId: string;
    clientSecret: string;
  }) {
    super("cora");
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // Teste simples de listagem de boletos (invoices)
      await this.authenticate();
      const response = await fetch(`${this.baseUrl}/invoices?limit=1`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return {
        status: response.ok ? "up" : "down",
        latency: Math.round(performance.now() - start),
      };
    } catch {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  private async authenticate() {
    if (this.token) return;
    // Lógica de troca de ClientID/Secret por Token OAuth2
    const response = await fetch(`${this.baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.clientId || "",
        client_secret: this.clientSecret || "",
      }),
    });
    const data = await response.json();
    this.token = data.access_token;
  }

  async createPaymentIntent(data: PaymentMethods): Promise<any> {
    // Validação solicitada
    if (data.type === "card") {
      throw new Error(
        "O gateway Cora não suporta pagamentos via Cartão de Crédito. Utilize Boleto ou PIX."
      );
    }

    await this.authenticate();

    // Se for Boleto na Cora (Invoices)
    const endpoint = data.type === "boleto" ? "/invoices" : "/pix/cash-in";

    const body = {
      amount: data.amount,
      customer: {
        name: "Cliente ERP",
        email: data.customerEmail,
      },
      // Configurações específicas de vencimento e multa iriam aqui
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createCustomer(email: string, name: string): Promise<any> {
    // A Cora geralmente atrela o cliente diretamente à Invoice/Boleto
    return { message: "Cliente gerenciado via Invoice na Cora", email, name };
  }

  async createSubscription(data: SubscriptionPlan): Promise<any> {
    throw new Error(
      "Recorrência nativa via API não disponível para Cora neste módulo. Implemente via Job de agendamento no ERP."
    );
  }

  async getCurrentFees(): Promise<any> {
    return {
      card_percentage: 0,
      card_fixed: 0,
      pix_percentage: 0,
      pix_fixed: 0, // Cora costuma ser zero ou valor fixo baixo
      boleto_fixed: 2.0,
    };
  }
}
