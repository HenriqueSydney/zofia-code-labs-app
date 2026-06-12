import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetRecentProjectsUseCase } from "@/useCases/stats/factories/makeGetRecentProjectsUseCase";

/**
 * Action para buscar a lista de Projetos Recentes (Table)
 */
export async function getRecentProjectsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: await serverErrorMessage("unauthenticated"),
      data: null,
    };
  }

  try {
    const useCase = makeGetRecentProjectsUseCase();

    const projects = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data: projects,
    };
  } catch (error: any) {
    console.error("Erro ao buscar projetos recentes:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar lista de projetos.",
      data: null,
    };
  }
}
