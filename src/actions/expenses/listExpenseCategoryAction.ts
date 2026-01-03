"use server";

import { auth } from "@/auth";
import { makeListExpenseCategoryUseCase } from "@/useCases/expenses/factories/makeListExpenseCategoryUseCase";

export async function listExpenseCategoryAction(query?: string | null) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: "Sessão expirada.", data: [] };
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
      message: "Erro ao listar categorias.",
      data: [],
    };
  }
}
