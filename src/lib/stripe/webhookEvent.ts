import type Stripe from "stripe";

export function buildStripeWebhookEventId(event: Stripe.Event): string {
  return `STRIPE:${event.id}`;
}

export function peekStripeOrganizationId(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as {
      data?: { object?: { metadata?: Record<string, string> } };
    };

    return parsed.data?.object?.metadata?.organizationId;
  } catch {
    return undefined;
  }
}

export function extractStripeInvoiceId(event: Stripe.Event): string | undefined {
  const object = event.data.object as {
    metadata?: Record<string, string>;
  };

  return object.metadata?.invoiceId;
}
