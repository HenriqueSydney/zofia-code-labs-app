import { AppError } from "@/errors/AppError";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getSprintMetricsAction } from "@/actions/sprint/getSprintMetricsAction";

// 2. Busca de Métricas de Sprint (Burndown e Histórico)
export const getCachedSprintMetrics = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: any;
    message?: string;
  }>("action", "getSprintMetricsAction", () => getSprintMetricsAction(slug), {
    cache: "no-cache",
  });

  if (error || !success?.success || !success?.data) {
    throw new AppError(
      success?.message || "Não foi possível recuperar as métricas de sprint"
    );
  }

  return success.data;
});
