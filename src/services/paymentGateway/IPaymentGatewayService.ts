export interface PaymentMethods {
  type: "card" | "pix" | "boleto";
  customerEmail: string;
  amount: number; // Centavos (padrão Stripe)
  currency: string;
  description?: string;
}

export interface SubscriptionPlan {
  customerId: string;
  priceId: string; // ID do preço no Stripe
}

export interface StripeFees {
  card_percentage: number;
  card_fixed: number;
  pix_percentage: number;
  pix_fixed: number;
  boleto_fixed: number;
}

export interface IPaymentGatewayService {
  healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;

  createPaymentIntent(data: PaymentMethods): Promise<any>;

  createCustomer(email: string, name: string): Promise<any>;
  createSubscription(data: SubscriptionPlan): Promise<any>;

  getCurrentFees(): Promise<StripeFees>;
}
