import { DeleteInvoiceUseCase } from "../DeleteInvoiceUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

let deleteInvoiceUseCase: DeleteInvoiceUseCase;

export function makeDeleteInvoiceUseCase() {
  if (!deleteInvoiceUseCase) {
    const invoiceRepository = makeInvoiceRepository();
    deleteInvoiceUseCase = new DeleteInvoiceUseCase(invoiceRepository);
  }

  return deleteInvoiceUseCase;
}
