import { ValidationError } from "@/errors";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { GitHubMetrics } from "@/useCases/integration/gitub/GetGitHubMetricsUseCase";
import { getGitHubMetricsAction } from "@/actions/integrations/github/getGitHubMetricsAction";

// Esta é a função única que todos os componentes vão importar
export const getCachedGitHubMetrics = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: GitHubMetrics; // Opcional para lidar com o caso de erro da Action
    message?: string;
  }>(
    "action",
    "getGitHubMetricsAction",
    () => {
      return getGitHubMetricsAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new ValidationError("Não foi possível recuperar a métricas");
  }
  if (!success?.data) {
    throw new ValidationError("Não foi possível recuperar a métricas");
  }

  return success.data;
});
