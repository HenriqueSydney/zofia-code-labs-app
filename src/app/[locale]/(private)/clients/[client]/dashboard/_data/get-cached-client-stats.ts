import { ValidationError } from "@/errors";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getClientStatsAction } from "@/actions/clients/getClientStatsAction";

// 1. Busca de Métricas de Backlog (Cards e Donut)
export const getCachedClientStats = cache(async (slug: string) => {
  const [error, success] = await operationWrapper(
    "action",
    "getClientStatsAction",
    () => getClientStatsAction(slug),
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new ValidationError(error.message || "Não foi possível recuperar as métricas de backlog");
  }

  return success;
});
