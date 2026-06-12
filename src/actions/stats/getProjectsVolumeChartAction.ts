import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeGetProjectsVolumeChartUseCase } from "@/useCases/stats/factories/makeGetProjectsVolumeChartUseCase";

/**
 * Action para buscar os dados do Gráfico de Volume (Bar Chart)
 */
export async function getProjectsVolumeChartAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: await serverErrorMessage("unauthenticated"),
      data: null,
    };
  }

  try {
    const useCase = makeGetProjectsVolumeChartUseCase();

    const chartData = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    return {
      success: true,
      data: chartData,
    };
  } catch (error: any) {
    console.error("Erro ao buscar gráfico de volume:", error);
    return {
      success: false,
      message: error.message || "Erro ao carregar dados do gráfico.",
      data: null,
    };
  }
}
