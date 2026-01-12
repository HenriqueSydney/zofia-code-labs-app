// useCases/financial/UpdateInvoiceUseCase.ts
import { IInvoiceRepository } from "@/repositories/IInvoiceRepository";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { AppError } from "@/errors/AppError";
import { Prisma } from "@/generated/prisma/client";

interface UpdateInvoiceRequest {
  id: string;
  userId: string;
  data: Prisma.InvoiceUncheckedUpdateInput;
}

export class UpdateInvoiceUseCase {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async execute({ id, userId, data }: UpdateInvoiceRequest): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError("Fatura não encontrada.");
    }

    await checkUserPermissionForAsset("invoice", userId, invoice, "UPDATE");

    await this.invoiceRepository.update(id, data);
  }
}
