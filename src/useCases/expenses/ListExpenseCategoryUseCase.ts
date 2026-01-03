import { ExpenseCategory } from "@/generated/prisma/client";
import { IExpenseCategoryRepository } from "@/repositories/IExpenseCategoryRepository";
import { PrismaToPlain } from "@/@types/PrismaToPlain";

interface FetchExpenseCategoryUseCaseRequest {
  organizationId: string;
  query?: string | null;
}

export class ListExpenseCategoryUseCase {
  constructor(private expenseCategoryRepository: IExpenseCategoryRepository) {}

  async execute({
    organizationId,
    query,
  }: FetchExpenseCategoryUseCaseRequest): Promise<{
    expenseCategories: PrismaToPlain<ExpenseCategory>[];
  }> {
    const expenseCategories = await this.expenseCategoryRepository.list(
      organizationId,
      query
    );

    return { expenseCategories };
  }
}
