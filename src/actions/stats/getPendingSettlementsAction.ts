import { auth } from "@/auth";
import { makeGetPendingSettlementsUseCase } from "@/useCases/stats/factories/makeGetPendingSettlementsUseCase";

/**
 * Busca pagamentos pendentes ou atrasados (Invoices)
 */
export async function getPendingSettlementsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Usuário não autenticado.",
      data: null,
    };
  }

  try {
    const useCase = makeGetPendingSettlementsUseCase();
    const settlements = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data: settlements,
    };
  } catch (error: any) {
    console.error("Erro ao buscar pagamentos pendentes:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar pendências.",
      data: null,
    };
  }
}
