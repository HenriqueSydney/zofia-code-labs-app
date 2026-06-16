import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";
import { GetPublicInvoiceConfirmationUseCase } from "../GetPublicInvoiceConfirmationUseCase";

let getPublicInvoiceConfirmationUseCase: GetPublicInvoiceConfirmationUseCase;

export function makeGetPublicInvoiceConfirmationUseCase() {
  if (!getPublicInvoiceConfirmationUseCase) {
    getPublicInvoiceConfirmationUseCase =
      new GetPublicInvoiceConfirmationUseCase(makeInvoiceRepository());
  }

  return getPublicInvoiceConfirmationUseCase;
}
