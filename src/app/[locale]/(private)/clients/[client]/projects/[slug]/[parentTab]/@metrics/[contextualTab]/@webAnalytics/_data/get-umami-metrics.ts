import { AppError } from "@/errors/AppError";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getUmamiMetricsAction } from "@/actions/integrations/getUmamiMetricsAction";
import { MetricsResponse } from "@/useCases/integration/GetUmamiMetricsUseCase";

// Esta é a função única que todos os componentes vão importar
export const getCachedUmamiMetrics = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: MetricsResponse; // Opcional para lidar com o caso de erro da Action
    message?: string;
  }>(
    "action",
    "getUmamiMetricsAction",
    () => {
      return getUmamiMetricsAction(slug);
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
