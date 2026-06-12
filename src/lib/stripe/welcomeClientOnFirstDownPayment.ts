import { isDownPaymentInvoice } from "@/lib/invoices/isDownPaymentInvoice";
import { maybeSendWelcomeClientEmail } from "@/lib/clients/welcomeClientEmail";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

export async function maybeSendWelcomeClientEmailOnFirstDownPayment(
  invoiceId: string,
): Promise<void> {
  const invoiceRepository = makeInvoiceRepository();
  const invoice = await invoiceRepository.findById(invoiceId);

  if (!invoice || !isDownPaymentInvoice(invoice)) {
    return;
  }

  await maybeSendWelcomeClientEmail({
    client: invoice.client,
    projectId: invoice.projectId,
    projectName: invoice.project.name,
    source: "first_down_payment_paid",
  });
}
