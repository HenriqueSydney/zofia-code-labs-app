import { auth } from "@/auth";
import { makeGetBacklogEvolutionUseCase } from "@/useCases/stats/factories/makeGetBacklogEvolutionUseCase";

export async function getBacklogEvolutionChartAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: null };

  try {
    const useCase = makeGetBacklogEvolutionUseCase();
    const data = await useCase.execute({
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, data: null };
  }
}
