// ----------------------------------------------------------------
// Configs por gateway
// ----------------------------------------------------------------

export interface StripeConfig {
  gateway: "stripe";
  apiKey: string;
}

export interface MercadoPagoConfig {
  gateway: "mercadopago";
  accessToken: string;
  publicKey?: string;
}

export interface InterConfig {
  gateway: "inter";
  clientId: string;
  clientSecret: string;
  certPem: string;
  keyPem: string;
  pixKey?: string; // chave Pix cadastrada na conta Inter
  sandbox?: boolean;
}

export type GatewayConfig = StripeConfig | MercadoPagoConfig | InterConfig;

// ----------------------------------------------------------------
// Pagador — obrigatório no Inter (boleto), opcional nos demais
// ----------------------------------------------------------------

export interface PayerInfo {
  name: string;
  document: string; // CPF ou CNPJ
  personType?: "FISICA" | "JURIDICA";
  email?: string;
  phone?: string;
  ddd?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string; // UF
  zipCode?: string;
}

// ----------------------------------------------------------------
// Payment Intent
// ----------------------------------------------------------------

export type PaymentMethodType = "card" | "pix" | "boleto";

export interface PaymentMethods {
  type: PaymentMethodType | PaymentMethodType[];
  amount: number; // centavos (padrão Stripe; MP converte internamente)
  currency: string;
  customerEmail: string;
  customerId?: string; // stripeCustomerId / equivalente por gateway
  invoiceId: string; // ID interno da fatura — obrigatório para reconciliação via webhook
  organizationId: string; // antes: organizationId — alinhado com o modelo multi-tenant
  description?: string;
  payer?: PayerInfo; // obrigatório no boleto Inter; opcional nos demais
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
  // card
  checkoutUrl?: string;
  // pix
  pixQrCodeBase64?: string;
  pixCopyPaste?: string;
  // boleto
  boletoUrl?: string;
}

// ----------------------------------------------------------------
// Subscription
// ----------------------------------------------------------------

export interface SubscriptionPlan {
  customerId: string;
  priceId: string;
  organizationId: string;
  payerEmail?: string; // exigido pelo Mercado Pago PreApproval
}

export interface SubscriptionResult {
  id: string;
  status: string;
  gatewayRaw?: unknown;
}

// ----------------------------------------------------------------
// Fees
// ----------------------------------------------------------------

export interface GatewayFees {
  card_percentage: number;
  card_fixed: number;
  pix_percentage: number;
  pix_fixed: number;
  boleto_fixed: number;
}

// ----------------------------------------------------------------
// Customer
// ----------------------------------------------------------------

export interface CustomerResult {
  gatewayCustomerId: string | null; // null quando o gateway não tem conceito de customer (Inter, MP)
  email: string;
  name: string;
  gateway: "stripe" | "mercadopago" | "inter";
  raw?: unknown;
}

// ----------------------------------------------------------------
// Interface principal
// ----------------------------------------------------------------

export interface IPaymentGatewayService {
  healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;

  createCustomer(email: string, name: string): Promise<CustomerResult>;

  createCheckoutSession(data: PaymentMethods): Promise<PaymentIntentResult>;

  createPaymentIntent(data: PaymentMethods): Promise<PaymentIntentResult>;

  createSubscription(data: SubscriptionPlan): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<SubscriptionResult>;

  getCurrentFees(): Promise<GatewayFees>;
}
