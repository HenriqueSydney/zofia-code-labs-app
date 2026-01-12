import { UpdateInvoiceUseCase } from "../UpdateInvoiceUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

let updateInvoiceUseCase: UpdateInvoiceUseCase;

export function makeUpdateInvoiceUseCase() {
  if (!updateInvoiceUseCase) {
    const invoiceRepository = makeInvoiceRepository();
    updateInvoiceUseCase = new UpdateInvoiceUseCase(invoiceRepository);
  }

  return updateInvoiceUseCase;
}
