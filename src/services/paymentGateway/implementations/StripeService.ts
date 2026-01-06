import { IntegrationBase } from "../../IntegrationBase";
import {
  IPaymentGatewayService,
  PaymentMethods,
  SubscriptionPlan,
  StripeFees,
} from "../IPaymentGatewayService";

export class StripeService
  extends IntegrationBase
  implements IPaymentGatewayService
{
  private baseUrl: string = "https://api.stripe.com/v1";
  private secretKey: string;

  constructor(config: { apiKey: string }) {
    super("stripe");
    this.secretKey = config.apiKey || "";
  }

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // Consultar o saldo é o teste mais comum de conectividade/auth
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: this.getAuthHeader(),
      });

      return {
        status: response.ok ? "up" : "down",
        latency: Math.round(performance.now() - start),
      };
    } catch {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  private getAuthHeader() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  /**
   * Cria uma intenção de pagamento para Cartão, PIX ou Boleto
   */
  async createPaymentIntent(data: PaymentMethods): Promise<any> {
    const body = new URLSearchParams({
      amount: data.amount.toString(),
      currency: data.currency.toLowerCase(),
      "payment_method_types[]": data.type,
      description: data.description || "",
      receipt_email: data.customerEmail,
    });

    // Se for boleto, o Stripe exige parâmetros adicionais do cliente
    if (data.type === "boleto") {
      body.append("payment_method_data[type]", "boleto");
      // Nota: Para boleto/pix real no Brasil, é necessário coletar CPF/CNPJ
    }

    const response = await fetch(`${this.baseUrl}/payment_intents`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: body.toString(),
    });

    return response.json();
  }

  async createCustomer(email: string, name: string): Promise<any> {
    const body = new URLSearchParams({ email, name });
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: body.toString(),
    });
    return response.json();
  }

  async createSubscription(data: SubscriptionPlan): Promise<any> {
    const body = new URLSearchParams({
      customer: data.customerId,
      "items[0][price]": data.priceId,
    });

    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: body.toString(),
    });

    return response.json();
  }

  /**
   * O Stripe não possui um endpoint que retorna "taxas dinâmicas" via API,
   * pois elas são contratuais. No entanto, podemos buscar os detalhes da conta
   * ou retornar um mapeamento baseado na região (Ex: Brasil).
   */
  async getCurrentFees(): Promise<StripeFees> {
    // Simulando busca de taxas padrão para Stripe Brasil (configurável via env)
    return {
      card_percentage: 3.99, // Exemplo médio
      card_fixed: 0.39,
      pix_percentage: 0.9,
      pix_fixed: 0.0,
      boleto_fixed: 3.45,
    };
  }
}
