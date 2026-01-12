import { GetInvoiceUseCase } from "../GetInvoiceUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

let getInvoiceUseCase: GetInvoiceUseCase;

export function makeGetInvoiceUseCase() {
  if (!getInvoiceUseCase) {
    const invoiceRepository = makeInvoiceRepository();
    getInvoiceUseCase = new GetInvoiceUseCase(invoiceRepository);
  }

  return getInvoiceUseCase;
}
