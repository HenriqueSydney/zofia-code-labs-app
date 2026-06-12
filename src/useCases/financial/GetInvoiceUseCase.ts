// useCases/financial/GetInvoiceUseCase.ts
import {
  IInvoiceRepository,
  InvoiceWithDetails,
} from "@/repositories/IInvoiceRepository";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { ResourceNotFoundError } from "@/errors";

interface GetInvoiceRequest {
  id: string;
  userId: string;
}

export class GetInvoiceUseCase {
  constructor(private invoiceRepository: IInvoiceRepository) {}

  async execute({
    id,
    userId,
  }: GetInvoiceRequest): Promise<InvoiceWithDetails> {
    const invoice = await this.invoiceRepository.findById(id);

    if (!invoice) {
      throw new ResourceNotFoundError("Fatura não encontrada.");
    }

    await checkUserPermissionForAsset("invoice", userId, invoice, "READ");

    return invoice;
  }
}
