import { ValidationError } from "@/errors";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getBacklogMetricsAction } from "@/actions/backlog/getBacklogMetricsAction";

// 1. Busca de Métricas de Backlog (Cards e Donut)
export const getCachedBacklogMetrics = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: any;
    message?: string;
  }>("action", "getBacklogMetricsAction", () => getBacklogMetricsAction(slug), {
    cache: "no-cache",
  });

  if (error || !success?.success || !success?.data) {
    throw new ValidationError(success?.message || "Não foi possível recuperar as métricas de backlog");
  }

  return success.data;
});
