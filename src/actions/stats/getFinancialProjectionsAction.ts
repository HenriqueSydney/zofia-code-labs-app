import { auth } from "@/auth";
import { makeGetFinancialProjectionsUseCase } from "@/useCases/stats/factories/makeGetFinancialProjectionsUseCase";

/**
 * Busca dados para a aba de Projeções Financeiras
 */
export async function getFinancialProjectionsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Usuário não autenticado.",
      data: null,
    };
  }

  try {
    const useCase = makeGetFinancialProjectionsUseCase();
    const projections = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data: projections,
    };
  } catch (error: any) {
    console.error("Erro ao buscar projeções:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar projeções.",
      data: null,
    };
  }
}
