import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseCategoryRepository } from "@/repositories/IExpenseCategoryRepository";

interface UpdateExpenseRequest {
  id: string;
  organizationId: string;
  userId: string;
  data: {
    name: string;
    description?: string | null;
  };
}

export class UpdateExpenseCategoryUseCase {
  constructor(private expenseCategoryRepository: IExpenseCategoryRepository) {}

  async execute({
    id,
    userId,
    organizationId,
    data,
  }: UpdateExpenseRequest): Promise<void> {
    // 1. Verificar se a categoria existe E pertence à organização
    const existingCategory = await this.expenseCategoryRepository.findById(
      id,
      organizationId
    );

    if (!existingCategory) {
      throw new Error(
        "Categoria de despesa não encontrada ou você não tem permissão para editá-la."
      );
    }

    await checkUserPermissionForAsset(
      "expenseCategory",
      userId,
      existingCategory,
      "UPDATE"
    );

    await this.expenseCategoryRepository.update(id, {
      ...data,
    });
  }
}
