import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetExpensesByCategoryUseCase } from "@/useCases/stats/factories/makeGetExpensesByCategoryUseCase";

/**
 * Busca dados para o gráfico de pizza (Despesas por Categoria)
 */
export async function getExpensesByCategoryAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: await serverErrorMessage("unauthenticated"),
      data: null,
    };
  }

  try {
    const useCase = makeGetExpensesByCategoryUseCase();
    const data = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Erro ao buscar categorias de despesa:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar gráfico de categorias.",
      data: null,
    };
  }
}
