import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { CreateInvoiceUseCase } from "../CreateInvoiceUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

let createInvoiceUseCase: CreateInvoiceUseCase;

export function makeCreateInvoiceUseCase() {
  if (!createInvoiceUseCase) {
    const invoiceRepository = makeInvoiceRepository();
    const projectRepository = makeProjectRepository();
    createInvoiceUseCase = new CreateInvoiceUseCase(
      invoiceRepository,
      projectRepository
    );
  }

  return createInvoiceUseCase;
}
