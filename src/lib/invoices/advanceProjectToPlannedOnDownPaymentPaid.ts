import { SYSTEM_WEBHOOK_USER_ID } from "@/constants/systemActors";
import { isDownPaymentInvoice } from "@/lib/invoices/isDownPaymentInvoice";
import { apiLogger } from "@/lib/logger";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

export async function maybeAdvanceProjectToPlannedOnDownPaymentPaid(
  invoiceId: string,
): Promise<void> {
  const invoiceRepository = makeInvoiceRepository();
  const invoice = await invoiceRepository.findById(invoiceId);

  if (!invoice || !isDownPaymentInvoice(invoice)) {
    return;
  }

  if (invoice.project.status !== "WAITING_DOWN_PAYMENT") {
    apiLogger.info(
      {
        invoiceId,
        projectId: invoice.projectId,
        projectStatus: invoice.project.status,
      },
      "Ignorando avanço para PLANNED — projeto não está aguardando entrada",
    );
    return;
  }

  const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
  await changeProjectStatusUseCase.execute({
    projectId: invoice.projectId,
    newStatus: "PLANNED",
    userId: SYSTEM_WEBHOOK_USER_ID,
    data: { observation: "Entrada confirmada via webhook de pagamento." },
  });
}
