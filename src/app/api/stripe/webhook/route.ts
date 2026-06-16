import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma } from "@/generated/prisma/client";
import { apiLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  buildStripeWebhookEventId,
  extractStripeInvoiceId,
  peekStripeOrganizationId,
  verifyStripeWebhookEvent,
} from "@/lib/stripe/webhookEvent";
import { maybeSendWelcomeClientEmailOnFirstDownPayment } from "@/lib/stripe/welcomeClientOnFirstDownPayment";
import { maybeAdvanceProjectToPlannedOnDownPaymentPaid } from "@/lib/invoices/advanceProjectToPlannedOnDownPaymentPaid";
import { maybeSendPaymentReceivedEmail } from "@/lib/invoices/invoicePaymentEmails";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

const invoiceRepository = makeInvoiceRepository();

type MarkInvoiceAsPaidResult = {
  success: boolean;
  wasNewlyPaid: boolean;
};

async function markInvoiceAsPaid(
  invoiceId: string,
  paidAt: Date,
): Promise<MarkInvoiceAsPaidResult> {
  const invoice = await invoiceRepository.findById(invoiceId);

  if (!invoice) {
    apiLogger.warn({ invoiceId }, "Fatura não encontrada para webhook Stripe");
    return { success: false, wasNewlyPaid: false };
  }

  if (invoice.status === "PAID") {
    return { success: true, wasNewlyPaid: false };
  }

  if (invoice.status === "CANCELLED") {
    apiLogger.warn(
      { invoiceId, status: invoice.status },
      "Ignorando pagamento Stripe para fatura cancelada",
    );
    return { success: false, wasNewlyPaid: false };
  }

  await invoiceRepository.updateStatus(invoiceId, "PAID", paidAt);
  return { success: true, wasNewlyPaid: true };
}

async function handleInvoicePaid(
  invoiceId: string,
  paidAt: Date,
): Promise<void> {
  const result = await markInvoiceAsPaid(invoiceId, paidAt);

  if (result.wasNewlyPaid) {
    await maybeSendWelcomeClientEmailOnFirstDownPayment(invoiceId);
    await maybeSendPaymentReceivedEmail(invoiceId, paidAt);
  }

  if (result.success) {
    await maybeAdvanceProjectToPlannedOnDownPaymentPaid(invoiceId);
  }
}

async function persistWebhookLog({
  eventId,
  eventType,
  invoiceId,
  payload,
  status,
  error,
}: {
  eventId: string;
  eventType: string;
  invoiceId?: string;
  payload: Prisma.InputJsonValue;
  status: "PROCESSED" | "FAILED" | "SKIPPED";
  error?: string;
}) {
  await prisma.webhookLog.upsert({
    where: { eventId },
    create: {
      provider: "STRIPE",
      eventType,
      documentId: invoiceId,
      eventId,
      payload,
      status,
      error,
    },
    update: {
      payload,
      status,
      error: error ?? null,
      documentId: invoiceId,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  let eventId: string | undefined;
  let stripeEvent: Stripe.Event | undefined;

  if (!signature) {
    return NextResponse.json(
      { error: "Assinatura Stripe ausente." },
      { status: 400 },
    );
  }
  try {
    stripeEvent = await verifyStripeWebhookEvent(body, signature);
    const organizationId = peekStripeOrganizationId(body);

    eventId = buildStripeWebhookEventId(stripeEvent);
    const payload = stripeEvent as unknown as Prisma.InputJsonValue;
    const invoiceId = extractStripeInvoiceId(stripeEvent);

    apiLogger.info(
      {
        eventType: stripeEvent.type,
        eventId,
        invoiceId,
        organizationId,
      },
      "Webhook Stripe recebido",
    );

    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== "paid") {
          await persistWebhookLog({
            eventId,
            eventType: stripeEvent.type,
            invoiceId,
            payload,
            status: "SKIPPED",
            error: `payment_status=${session.payment_status}`,
          });
          break;
        }

        const sessionInvoiceId = session.metadata?.invoiceId ?? invoiceId;
        if (!sessionInvoiceId) {
          await persistWebhookLog({
            eventId,
            eventType: stripeEvent.type,
            payload,
            status: "SKIPPED",
            error: "invoiceId ausente no metadata",
          });
          break;
        }

        const paidAt = session.created
          ? new Date(session.created * 1000)
          : new Date();

        await handleInvoicePaid(sessionInvoiceId, paidAt);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        const intentInvoiceId = paymentIntent.metadata?.invoiceId ?? invoiceId;

        if (!intentInvoiceId) {
          await persistWebhookLog({
            eventId,
            eventType: stripeEvent.type,
            payload,
            status: "SKIPPED",
            error: "invoiceId ausente no metadata",
          });
          break;
        }

        const paidAt = paymentIntent.created
          ? new Date(paymentIntent.created * 1000)
          : new Date();

        await handleInvoicePaid(intentInvoiceId, paidAt);
        break;
      }

      case "payment_intent.payment_failed": {
        const failedIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        apiLogger.warn(
          {
            paymentIntentId: failedIntent.id,
            invoiceId: failedIntent.metadata?.invoiceId ?? invoiceId,
            lastPaymentError: failedIntent.last_payment_error?.message,
          },
          "Pagamento Stripe falhou",
        );
        break;
      }

      default:
        apiLogger.info(
          { eventType: stripeEvent.type },
          "Evento Stripe ignorado",
        );
    }

    await persistWebhookLog({
      eventId,
      eventType: stripeEvent.type,
      invoiceId,
      payload,
      status: "PROCESSED",
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    apiLogger.error({ err: error, eventId }, "Erro no webhook Stripe");

    if (eventId && stripeEvent) {
      try {
        await persistWebhookLog({
          eventId,
          eventType: stripeEvent.type,
          invoiceId: extractStripeInvoiceId(stripeEvent),
          payload: stripeEvent as unknown as Prisma.InputJsonValue,
          status: "FAILED",
          error: message,
        });
      } catch (logError) {
        apiLogger.error(
          { err: logError },
          "Falha ao persistir log do webhook Stripe",
        );
      }
    }

    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
