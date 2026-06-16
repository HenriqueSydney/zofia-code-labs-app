import Stripe from "stripe";
import { collectStripeWebhookSecretCandidates } from "@/lib/stripe/resolveStripeWebhookSecret";

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

export async function verifyStripeWebhookEvent(
  body: string,
  signature: string,
): Promise<Stripe.Event> {
  const organizationId = peekStripeOrganizationId(body);
  const candidates =
    await collectStripeWebhookSecretCandidates(organizationId);

  if (candidates.length === 0) {
    throw new Error(
      "Nenhum STRIPE_WEBHOOK_SECRET disponível (variável de ambiente ou Infisical por organização).",
    );
  }

  let lastError: unknown;
  for (const secret of candidates) {
    try {
      return Stripe.webhooks.constructEvent(
        body,
        signature,
        secret,
      ) as Stripe.Event;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Assinatura Stripe inválida.");
}
