import { IInvoiceRepository } from "@/repositories/IInvoiceRepository";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { AppError } from "@/errors/AppError";

interface DeleteInvoiceRequest {
  id: string;
  userId: string;
}

export class DeleteInvoiceUseCase {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async execute({ id, userId }: DeleteInvoiceRequest): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError("Fatura não encontrada.");
    }

    await checkUserPermissionForAsset("invoice", userId, invoice, "DELETE");

    await this.invoiceRepository.delete(id);
  }
}
