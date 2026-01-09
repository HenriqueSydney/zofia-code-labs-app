import { AppError } from "@/errors/AppError";
import { cache } from "react";
import { getSonarQubeMetricsAction } from "@/actions/integrations/getSonarQubeMetricsAction";
import { operationWrapper } from "@/lib/operationWrapper";

// Esta é a função única que todos os componentes vão importar
export const getCachedSonarMetrics = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: any; // Opcional para lidar com o caso de erro da Action
    message?: string;
  }>(
    "action",
    "getSonarQubeMetricsAction",
    () => {
      return getSonarQubeMetricsAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new AppError("Não foi possível recuperar a métricas");
  }
  if (!success?.data) {
    throw new AppError("Não foi possível recuperar a métricas");
  }

  return success.data.metrics;
});
