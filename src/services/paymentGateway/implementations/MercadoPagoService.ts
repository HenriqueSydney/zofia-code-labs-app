import { envVariables } from "@/env";
import {
  MercadoPagoConfig as MPConfig,
  Payment,
  PreApproval,
  Preference,
} from "mercadopago";
import { IntegrationBase } from "../../IntegrationBase";
import {
  IPaymentGatewayService,
  MercadoPagoConfig,
  PaymentMethods,
  SubscriptionPlan,
  GatewayFees,
  PaymentIntentResult,
  CustomerResult,
} from "../IPaymentGatewayService";

export class MercadoPagoError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MercadoPagoError";
  }
}

export class MercadoPagoService
  extends IntegrationBase
  implements IPaymentGatewayService
{
  private payment: Payment;
  private preApproval: PreApproval;
  private preference: Preference;

  constructor(config: MercadoPagoConfig) {
    super("mercadopago");

    const mpConfig = new MPConfig({ accessToken: config.accessToken });
    this.payment = new Payment(mpConfig);
    this.preApproval = new PreApproval(mpConfig);
    this.preference = new Preference(mpConfig);
  }

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // Tenta criar um pagamento inválido só pra testar auth — MP não tem endpoint de health
      await this.payment.get({ id: 0 });
      return { status: "up", latency: Math.round(performance.now() - start) };
    } catch (err: any) {
      // 404 = auth ok, recurso não existe — conexão está up
      const isAuthOk = err?.status === 404 || err?.cause?.[0]?.code === 2000;
      return {
        status: isAuthOk ? "up" : "down",
        latency: Math.round(performance.now() - start),
      };
    }
  }

  async createCustomer(
    email: string,
    name: string,
    _organizationId?: string,
  ): Promise<CustomerResult> {
    return {
      gatewayCustomerId: null,
      email: email,
      name: name,
      gateway: "mercadopago",
      raw: null,
    };
  }

  async createCheckoutSession(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    try {
      const payer = data.payer;
      const nameParts = payer?.name?.split(" ") ?? [];

      const result = await this.preference.create({
        body: {
          items: [
            {
              id: data.invoiceId,
              title: data.description ?? "Fatura",
              quantity: 1,
              currency_id: "BRL",
              unit_price: data.amount / 100, // MP usa reais
            },
          ],
          payer: {
            name: nameParts[0] ?? "",
            surname: nameParts.slice(1).join(" ") ?? "",
            email: data.customerEmail,
            identification: payer?.document
              ? {
                  type:
                    payer.document.replace(/\D/g, "").length > 11
                      ? "CNPJ"
                      : "CPF",
                  number: payer.document.replace(/\D/g, ""),
                }
              : undefined,
            phone:
              payer?.ddd && payer?.phone
                ? { area_code: payer.ddd, number: payer.phone }
                : undefined,
          },
          back_urls: {
            success: `${envVariables.BASE_URL}/invoices/${data.invoiceId}?paid=true`,
            failure: `${envVariables.BASE_URL}/invoices/${data.invoiceId}?error=true`,
            pending: `${envVariables.BASE_URL}/invoices/${data.invoiceId}?pending=true`,
          },
          auto_return: "approved",
          notification_url: `${envVariables.BASE_URL}/webhooks/mercadopago`,
          external_reference: data.invoiceId, // chave de reconciliação no webhook
          expiration_date_to: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          metadata: {
            invoiceId: data.invoiceId,
            organizationId: data.organizationId,
          },
        },
      });

      return {
        id: result.id!,
        clientSecret: result.id!, // mantém compatibilidade de tipo
        checkoutUrl: result.init_point!, // ← URL real de pagamento
        status: "pending",
        amount: data.amount,
        currency: "brl",
      };
    } catch (err) {
      throw new MercadoPagoError(
        "Falha ao criar sessão de checkout no Mercado Pago",
        err,
      );
    }
  }

  /**
   * Cria uma preferência de pagamento (equivalente ao PaymentIntent do Stripe).
   * Suporta Pix, boleto e cartão via checkout MP.
   */
  async createPaymentIntent(
    data: PaymentMethods,
  ): Promise<PaymentIntentResult> {
    const result = await this.payment.create({
      body: {
        transaction_amount: data.amount / 100,
        description: data.description ?? "",
        external_reference: data.invoiceId,
        payer: { email: data.customerEmail },
        payment_method_id: this.mapPaymentType(data.type),
        metadata: {
          invoiceId: data.invoiceId,
          organizationId: data.organizationId,
        },
      },
    });

    const txData = result.point_of_interaction?.transaction_data;

    return {
      id: String(result.id),
      clientSecret: txData?.qr_code ?? "",
      status: result.status ?? "pending",
      amount: Math.round((result.transaction_amount ?? 0) * 100),
      currency: "brl",
      pixQrCodeBase64: txData?.qr_code_base64 ?? undefined,
      pixCopyPaste: txData?.qr_code ?? undefined,
      boletoUrl: result.transaction_details?.external_resource_url ?? undefined,
    };
  }

  async createSubscription(data: SubscriptionPlan): Promise<any> {
    try {
      return await this.preApproval.create({
        body: {
          preapproval_plan_id: data.priceId,
          payer_email: data.payerEmail,
          external_reference: data.organizationId,
        },
      });
    } catch (err) {
      throw new MercadoPagoError(
        "Falha ao criar assinatura no Mercado Pago",
        err,
      );
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      return await this.preApproval.update({
        id: subscriptionId,
        body: { status: "cancelled" },
      });
    } catch (err) {
      throw new MercadoPagoError(
        "Falha ao cancelar assinatura no Mercado Pago",
        err,
      );
    }
  }

  async getCurrentFees(): Promise<GatewayFees> {
    // Taxas contratuais MP Brasil — atualizar conforme contrato
    return {
      card_percentage: 4.99,
      card_fixed: 0.0,
      pix_percentage: 1.19,
      pix_fixed: 0.0,
      boleto_fixed: 3.99,
    };
  }

  private mapPaymentType(type: string | string[]): string {
    const t = Array.isArray(type) ? type[0] : type;
    const map: Record<string, string> = {
      card: "credit_card",
      pix: "pix",
      boleto: "boleto",
    };
    return map[t] ?? t;
  }
}
