import { InvoiceChargeType } from "@/generated/prisma/enums";

type InvoiceChargeTypeSource = {
  chargeType: InvoiceChargeType;
};

export function isDownPaymentInvoice(invoice: InvoiceChargeTypeSource): boolean {
  return invoice.chargeType === InvoiceChargeType.DOWN_PAYMENT;
}
