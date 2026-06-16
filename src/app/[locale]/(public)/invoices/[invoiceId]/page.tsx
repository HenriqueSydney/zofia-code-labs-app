import { FinancialStatus } from "@/generated/prisma/enums";
import { PaymentType } from "@/generated/prisma/client";
import { ResourceNotFoundError } from "@/errors";
import { date } from "@/lib/dayjs";
import { makeGetPublicInvoiceConfirmationUseCase } from "@/useCases/financial/factories/makeGetPublicInvoiceConfirmationUseCase";
import { formatCurrency } from "@/utils/formatCurrency";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  PaymentConfirmationView,
  PaymentConfirmationVariant,
} from "./_components/PaymentConfirmationView";

interface InvoicePaymentPageProps {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ paid?: string }>;
}

function resolveVariant(
  paid: string | undefined,
  status: FinancialStatus,
): PaymentConfirmationVariant {
  if (paid === "false" || paid !== "true") return "cancelled";
  if (status === FinancialStatus.PAID) return "success";
  if (status === FinancialStatus.CANCELLED) return "cancelled";
  return "processing";
}

function resolvePaymentMethodLabel(
  paymentType: PaymentType,
  labels: Record<PaymentType, string>,
): string {
  return labels[paymentType];
}

export async function generateMetadata({
  params,
  searchParams,
}: InvoicePaymentPageProps) {
  const { invoiceId } = await params;
  const { paid } = await searchParams;
  const t = await getTranslations("invoices.paymentConfirmation.metadata");

  try {
    const invoice =
      await makeGetPublicInvoiceConfirmationUseCase().execute(invoiceId);
    const variant = resolveVariant(paid, invoice.status);

    return {
      title: t(`title.${variant}`),
      description: t(`description.${variant}`, {
        clientName: invoice.clientName,
      }),
    };
  } catch {
    return {
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
    };
  }
}

export default async function InvoicePaymentPage({
  params,
  searchParams,
}: InvoicePaymentPageProps) {
  const { invoiceId } = await params;
  const { paid } = await searchParams;
  const t = await getTranslations("invoices.paymentConfirmation");

  let invoice;

  try {
    invoice = await makeGetPublicInvoiceConfirmationUseCase().execute(invoiceId);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      notFound();
    }
    throw error;
  }

  const variant = resolveVariant(paid, invoice.status);
  const paymentMethodLabels: Record<PaymentType, string> = {
    PIX: t("paymentMethods.PIX"),
    BOLETO: t("paymentMethods.BOLETO"),
    CREDIT_CARD: t("paymentMethods.CREDIT_CARD"),
    DEBIT_CARD: t("paymentMethods.DEBIT_CARD"),
  };

  return (
    <PaymentConfirmationView
      variant={variant}
      clientName={invoice.clientName}
      projectName={invoice.projectName}
      amount={formatCurrency(invoice.amount)}
      paymentDate={
        invoice.paidAt ? date(invoice.paidAt).format("DD/MM/YYYY HH:mm") : null
      }
      paymentMethod={resolvePaymentMethodLabel(
        invoice.paymentType,
        paymentMethodLabels,
      )}
      description={invoice.description}
      transactionId={invoice.transactionId}
      isDownPayment={invoice.isDownPayment}
      projectPaymentsHref={`/clients/${invoice.clientSlug}/projects/${invoice.projectSlug}/commercial/payments`}
    />
  );
}
