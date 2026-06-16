import { FinancialStatus, PaymentType } from "@/generated/prisma/client";
import { ResourceNotFoundError } from "@/errors";
import { isDownPaymentInvoice } from "@/lib/invoices/isDownPaymentInvoice";
import { IInvoiceRepository } from "@/repositories/IInvoiceRepository";

export interface PublicInvoiceConfirmation {
  id: string;
  clientName: string;
  projectName: string;
  clientSlug: string;
  projectSlug: string;
  amount: number;
  paidAt: Date | null;
  status: FinancialStatus;
  paymentType: PaymentType;
  description: string;
  transactionId: string | null;
  isDownPayment: boolean;
}

function sanitizeInvoiceDescription(description: string): string {
  return description.replace(/\s*\[gateway:[^\]]+\]/, "").trim();
}

function extractGatewayTransactionId(description: string): string | null {
  const match = description.match(/\[gateway:([^\]]+)\]/);
  return match?.[1] ?? null;
}

export class GetPublicInvoiceConfirmationUseCase {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async execute(id: string): Promise<PublicInvoiceConfirmation> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new ResourceNotFoundError("Fatura não encontrada.");
    }

    return {
      id: invoice.id,
      clientName: invoice.client.tradeName,
      projectName: invoice.project.name,
      clientSlug: invoice.client.slug,
      projectSlug: invoice.project.slug,
      amount: Number(invoice.amount),
      paidAt: invoice.paidAt,
      status: invoice.status,
      paymentType: invoice.paymentType,
      description: sanitizeInvoiceDescription(invoice.description),
      transactionId: extractGatewayTransactionId(invoice.description),
      isDownPayment: isDownPaymentInvoice(invoice),
    };
  }
}
