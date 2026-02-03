import { auth } from "@/auth";
import { makeGetRecentTransactionsUseCase } from "@/useCases/stats/factories/makeGetRecentTransactionsUseCase";

/**
 * Busca a lista de transações recentes (Receitas e Despesas misturadas)
 */
export async function getRecentTransactionsAction(limit: number = 20) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Usuário não autenticado.",
      data: null,
    };
  }

  try {
    const useCase = makeGetRecentTransactionsUseCase();
    const transactions = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      limit,
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error: any) {
    console.error("Erro ao buscar transações:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar transações.",
      data: null,
    };
  }
}
