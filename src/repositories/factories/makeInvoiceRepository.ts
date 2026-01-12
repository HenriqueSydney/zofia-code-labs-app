import { IInvoiceRepository } from "../IInvoiceRepository";
import { PrismaInvoiceRepository } from "../prisma/PrismaInvoiceRepository";

let invoiceRepo: IInvoiceRepository | null = null;

export function makeInvoiceRepository() {
  if (!invoiceRepo) {
    invoiceRepo = new PrismaInvoiceRepository();
  }
  return invoiceRepo;
}
