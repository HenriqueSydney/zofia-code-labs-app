import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseCategoryRepository } from "@/repositories/IExpenseCategoryRepository";

interface DeleteExpenseRequest {
  id: string;
  organizationId: string;
  userId: string;
}

export class DeleteExpenseCategoryUseCase {
  constructor(private expenseCategoryRepository: IExpenseCategoryRepository) {}

  async execute({
    id,
    userId,
    organizationId,
  }: DeleteExpenseRequest): Promise<void> {
    // 1. Verificar propriedade antes de deletar (segurança multi-tenant)
    const existingCategory = await this.expenseCategoryRepository.findById(
      id,
      organizationId
    );

    if (!existingCategory) {
      throw new Error(
        "Categoria de despesa não encontrada ou você não tem permissão para removê-la."
      );
    }

    await checkUserPermissionForAsset(
      "expenseCategory",
      userId,
      existingCategory,
      "UPDATE"
    );

    // 2. Deletar (executa o soft delete no repositório)
    await this.expenseCategoryRepository.delete(id);
  }
}
