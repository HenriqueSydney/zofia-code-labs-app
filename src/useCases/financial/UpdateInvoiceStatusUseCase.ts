// @/useCases/financial/UpdateInvoiceStatusUseCase.ts
import { IInvoiceRepository } from "@/repositories/IInvoiceRepository";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { AppError } from "@/errors/AppError";
import { FinancialStatus } from "@/generated/prisma/enums";

interface UpdateInvoiceStatusRequest {
  id: string;
  userId: string;
  status: FinancialStatus;
  paidAt?: Date | null;
}

export class UpdateInvoiceStatusUseCase {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async execute({
    id,
    userId,
    status,
    paidAt,
  }: UpdateInvoiceStatusRequest): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError("Fatura não encontrada.");
    }

    // Valida se o usuário tem permissão para atualizar esta fatura específica
    await checkUserPermissionForAsset("invoice", userId, invoice, "UPDATE");

    const finalPaidAt = status === "PAID" ? paidAt ?? new Date() : null;

    await this.invoiceRepository.updateStatus(id, status, finalPaidAt);
  }
}
