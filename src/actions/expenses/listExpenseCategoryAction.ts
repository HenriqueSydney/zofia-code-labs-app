"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeListExpenseCategoryUseCase } from "@/useCases/expenses/factories/makeListExpenseCategoryUseCase";

export async function listExpenseCategoryAction(query?: string | null) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: await serverErrorMessage("sessionExpired"), data: [] };
  }

  try {
    const listUseCase = makeListExpenseCategoryUseCase();

    const { expenseCategories } = await listUseCase.execute({
      organizationId: session.user.organizationId,
      query,
    });

    return {
      success: true,
      data: expenseCategories,
    };
  } catch (error) {
    return {
      success: false,
      message: await serverErrorMessage("categoriesListFailed"),
      data: [],
    };
  }
}
