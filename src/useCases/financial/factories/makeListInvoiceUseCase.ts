import { makeProjectRepository } from "@/repositories/factories/makeProjectRepository";
import { ListInvoicesByProjectUseCase } from "../ListInvoicesByProjectUseCase";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";

let listInvoiceUseCase: ListInvoicesByProjectUseCase;

export function makeListInvoiceUseCase() {
  if (!listInvoiceUseCase) {
    const invoiceRepository = makeInvoiceRepository();
    const projectRepository = makeProjectRepository();
    listInvoiceUseCase = new ListInvoicesByProjectUseCase(
      invoiceRepository,
      projectRepository
    );
  }

  return listInvoiceUseCase;
}
