import { IntegrationBase } from "../../IntegrationBase";
import {
  IPaymentGatewayService,
  PaymentMethods,
  SubscriptionPlan,
} from "../IPaymentGatewayService";

export class MercadoPagoService
  extends IntegrationBase
  implements IPaymentGatewayService
{
  private baseUrl: string = "https://api.mercadopago.com";
  private accessToken: string;

  constructor(config: { accessToken: string }) {
    super("mercado-pago");
    this.accessToken = config.accessToken || "";
  }

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      const response = await fetch(`${this.baseUrl}/v1/payment_methods`, {
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

  async createPaymentIntent(data: PaymentMethods): Promise<any> {
    const body: any = {
      transaction_amount: data.amount / 100, // MP usa decimais (10.50)
      description: data.description,
      payer: { email: data.customerEmail },
    };

    if (data.type === "pix") body.payment_method_id = "pix";
    else if (data.type === "boleto") body.payment_method_id = "bolbradesco";
    // Para cartão, o 'token' deve vir do front-end no objeto data (estendendo a interface se necessário)

    const response = await fetch(`${this.baseUrl}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createCustomer(email: string, name: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v1/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, first_name: name }),
    });
    return response.json();
  }

  async createSubscription(data: SubscriptionPlan): Promise<any> {
    const response = await fetch(`${this.baseUrl}/preapproval`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payer_email: data.customerId, // No MP simplificado usa-se o email ou ID
        reason: "Assinatura SaaS",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 100, // Exemplo
          currency_id: "BRL",
        },
        status: "authorized",
      }),
    });
    return response.json();
  }

  async getCurrentFees(): Promise<any> {
    return {
      card_percentage: 3.99,
      card_fixed: 0.0,
      pix_percentage: 0.99,
      pix_fixed: 0.0,
      boleto_fixed: 3.49,
    };
  }
}
