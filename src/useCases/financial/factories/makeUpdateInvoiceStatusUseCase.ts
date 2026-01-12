import { UpdateInvoiceStatusUseCase } from "../UpdateInvoiceStatusUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

let updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase;

export function makeUpdateInvoiceStatusUseCase() {
  if (!updateInvoiceStatusUseCase) {
    const invoiceRepository = makeInvoiceRepository();
    updateInvoiceStatusUseCase = new UpdateInvoiceStatusUseCase(
      invoiceRepository
    );
  }

  return updateInvoiceStatusUseCase;
}
