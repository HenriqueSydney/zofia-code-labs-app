import { ConflictError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IExpenseCategoryRepository } from "@/repositories/IExpenseCategoryRepository";

interface CreateExpenseCategoryUseCaseRequest {
  organizationId: string;
  userId: string;
  name: string;
  description?: string | null;
}

export class CreateExpenseCategoryUseCase {
  constructor(private expenseCategoryRepository: IExpenseCategoryRepository) {}

  async execute({
    organizationId,
    userId,
    name,
    description,
  }: CreateExpenseCategoryUseCaseRequest): Promise<void> {
    const categoryAlreadyExists =
      await this.expenseCategoryRepository.findByName(name, organizationId);

    await checkUserPermissionForAsset(
      "expenseCategory",
      userId,
      { organizationId },
      "CREATE",
    );

    if (categoryAlreadyExists) {
      throw new ConflictError("Já existe uma categoria de despesa cadastrada com este nome.",);
    }

    await this.expenseCategoryRepository.create({
      organizationId,
      name,
      description,
    });
  }
}
