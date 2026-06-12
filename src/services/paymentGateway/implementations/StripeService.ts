import Stripe from "stripe";
import { IntegrationBase } from "../../IntegrationBase";
import {
  IPaymentGatewayService,
  PaymentMethods,
  SubscriptionPlan,
  GatewayFees,
  PaymentIntentResult,
  CustomerResult,
} from "../IPaymentGatewayService";

export class StripeError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "StripeError";
  }
}

export class StripeService
  extends IntegrationBase
  implements IPaymentGatewayService
{
  private client: Stripe;

  constructor(config: { apiKey: string }) {
    super("stripe");
    this.client = new Stripe(config.apiKey, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      await this.client.balance.retrieve();
      return { status: "up", latency: Math.round(performance.now() - start) };
    } catch {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  async createCustomer(email: string, name: string): Promise<CustomerResult> {
    try {
      const customer = await this.client.customers.create({ email, name });
      return {
        gatewayCustomerId: customer.id,
        email: customer.email ?? email,
        name: customer.name ?? name,
        gateway: "stripe",
        raw: customer,
      };
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  async createCheckoutSession(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    try {
      const session = await this.client.checkout.sessions.create({
        mode: "payment",
        customer: data.customerId,
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              unit_amount: data.amount, // já em centavos
              product_data: { name: data.description ?? "Fatura" },
            },
            quantity: 1,
          },
        ],
        payment_method_types: ["card"],
        customer_email: data.customerId ? undefined : data.customerEmail,
        success_url: `${process.env.APP_URL}/invoices/${data.invoiceId}?paid=true`,
        cancel_url: `${process.env.APP_URL}/invoices/${data.invoiceId}`,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        metadata: {
          invoiceId: data.invoiceId,
          organizationId: data.organizationId,
        },
      });

      return {
        id: session.id,
        clientSecret: session.id, // mantém compatibilidade de tipo
        checkoutUrl: session.url!, // ← URL real de pagamento
        status: session.status ?? "open",
        amount: data.amount,
        currency: data.currency,
      };
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  /**
   * Cria um Payment Intent para faturas de projeto (one-off).
   * O customerId e invoiceId no metadata são obrigatórios para reconciliação via webhook.
   */
  async createPaymentIntent(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    const methodId = data.type === "pix" ? "pix" : "boleto";
    const payerDocument =
      process.env.NODE_ENV === "development"
        ? "00000000000191"
        : data.payer?.document?.replace(/\D/g, "");

    const intent = await this.client.paymentIntents.create({
      amount: data.amount,
      currency: data.currency.toLowerCase(),
      customer: data.customerId,
      payment_method_types: [methodId],
      payment_method_data: {
        type: methodId as "pix" | "boleto",
        ...(methodId === "boleto" && {
          boleto: { tax_id: payerDocument ?? "" },
          billing_details: {
            name: data.payer?.name ?? "",
            email: data.customerEmail,
            address: {
              country: "BR",
              line1: data.payer?.address ?? "N/A",
              city: data.payer?.city ?? "N/A",
              state: data.payer?.state ?? "SP",
              postal_code:
                data.payer?.zipCode?.replace(/\D/g, "") ?? "00000000",
            },
          },
        }),
      },
      confirm: true, // ← necessário para next_action aparecer
      description: data.description ?? "",
      receipt_email: data.customerEmail,
      metadata: {
        invoiceId: data.invoiceId,
        organizationId: data.organizationId,
      },
    });

    const next = intent.next_action;

    return {
      id: intent.id,
      clientSecret: intent.client_secret!,
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
      pixQrCodeBase64: next?.pix_display_qr_code?.image_url_png ?? undefined,
      pixCopyPaste: next?.pix_display_qr_code?.data ?? undefined,
      boletoUrl: next?.boleto_display_details?.hosted_voucher_url ?? undefined,
    };
  }

  async createSubscription(
    data: SubscriptionPlan,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.client.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        metadata: {
          organizationId: data.organizationId,
        },
      });
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.client.subscriptions.cancel(subscriptionId);
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  /**
   * Taxas contratuais — não existe endpoint na API do Stripe para isso.
   * Atualizar conforme contrato vigente.
   */
  async getCurrentFees(): Promise<GatewayFees> {
    return {
      card_percentage: 3.99,
      card_fixed: 0.39,
      pix_percentage: 0.9,
      pix_fixed: 0.0,
      boleto_fixed: 3.45,
    };
  }

  private normalizeError(err: unknown): StripeError {
    if (err instanceof Stripe.errors.StripeError) {
      return new StripeError(err.message, err.code, err.statusCode);
    }
    return new StripeError("Unexpected error", undefined, 500);
  }
}
