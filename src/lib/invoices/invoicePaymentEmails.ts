import { PaymentType } from "@/generated/prisma/client";
import {
  sendPaymentPendingEmail,
  sendPaymentReceivedEmail,
} from "@/email/send";
import { resolveClientContactEmail } from "@/lib/clients/resolveClientContactEmail";
import { date } from "@/lib/dayjs";
import { apiLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { InvoiceWithDetails } from "@/repositories/IInvoiceRepository";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";
import { formatCurrency } from "@/utils/formatCurrency";

type PaymentMethodType = "card" | "pix" | "boleto";

function resolveAppBaseUrl(): string {
  return (
    process.env.BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function mapPaymentTypeToMethodType(paymentType: PaymentType): PaymentMethodType {
  const map: Record<PaymentType, PaymentMethodType> = {
    PIX: "pix",
    BOLETO: "boleto",
    CREDIT_CARD: "card",
    DEBIT_CARD: "card",
  };

  return map[paymentType];
}

function buildInvoicePaymentsUrl(clientSlug: string, projectSlug: string): string {
  return `${resolveAppBaseUrl()}/clients/${clientSlug}/projects/${projectSlug}/commercial/payments`;
}

function extractGatewayTransactionId(description: string): string {
  const match = description.match(/\[gateway:([^\]]+)\]/);
  return match?.[1] ?? description;
}

export async function sendPaymentPendingEmailForInvoice(
  invoice: InvoiceWithDetails,
  options?: {
    paymentLink?: string;
    pixQrCodeBase64?: string;
    pixCopyPaste?: string;
    boletoUrl?: string;
  },
): Promise<void> {
  const contactEmail = resolveClientContactEmail(invoice.client);

  if (!contactEmail) {
    return;
  }

  await sendPaymentPendingEmail({
    to: contactEmail,
    clientName: invoice.client.tradeName || invoice.client.companyName,
    invoiceId: invoice.id,
    amount: formatCurrency(Number(invoice.amount)),
    dueDate: date(invoice.dueDate).format("DD [de] MMMM [de] YYYY"),
    servicesDescription: invoice.project.name,
    paymentMethodType: mapPaymentTypeToMethodType(invoice.paymentType),
    paymentLink: options?.paymentLink,
    pixQrCodeBase64: options?.pixQrCodeBase64,
    pixCopyPaste: options?.pixCopyPaste,
    boletoUrl: options?.boletoUrl,
  });
}

export async function maybeSendPaymentPendingEmailForInvoiceId(
  invoiceId: string,
): Promise<void> {
  const invoice = await makeInvoiceRepository().findById(invoiceId);

  if (!invoice || invoice.status !== "PENDING") {
    return;
  }

  try {
    await sendPaymentPendingEmailForInvoice(invoice);
    apiLogger.info({ invoiceId }, "PaymentPendingEmail enviado");
  } catch (error) {
    apiLogger.error(
      { err: error, invoiceId },
      "Falha ao enviar PaymentPendingEmail",
    );
  }
}

export async function maybeSendPaymentReceivedEmail(
  invoiceId: string,
  paidAt: Date,
): Promise<void> {
  const invoice = await makeInvoiceRepository().findById(invoiceId);

  if (!invoice || invoice.status !== "PAID") {
    return;
  }

  const contactEmail = resolveClientContactEmail(invoice.client);

  if (!contactEmail) {
    return;
  }

  const nextPending = await prisma.invoice.findFirst({
    where: {
      projectId: invoice.projectId,
      status: "PENDING",
      id: { not: invoice.id },
    },
    orderBy: { dueDate: "asc" },
    select: { dueDate: true },
  });

  try {
    await sendPaymentReceivedEmail({
      to: contactEmail,
      clientName: invoice.client.tradeName || invoice.client.companyName,
      amount: formatCurrency(Number(invoice.amount)),
      paymentDate: date(paidAt).format("DD/MM/YYYY"),
      transactionId: extractGatewayTransactionId(invoice.description),
      nextDueDate: nextPending
        ? date(nextPending.dueDate).format("DD/MM/YYYY")
        : undefined,
      receiptUrl: buildInvoicePaymentsUrl(
        invoice.client.slug,
        invoice.project.slug,
      ),
    });

    apiLogger.info({ invoiceId }, "PaymentReceivedEmail enviado");
  } catch (error) {
    apiLogger.error(
      { err: error, invoiceId },
      "Falha ao enviar PaymentReceivedEmail",
    );
  }
}
