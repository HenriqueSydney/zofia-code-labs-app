import { AppError } from "@/errors/AppError";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getClientBlockersAction } from "@/actions/clients/getClientBlockersAction";

// 1. Busca de Métricas de Backlog (Cards e Donut)
export const getCachedClientBlockers = cache(async (slug: string) => {
  const [error, success] = await operationWrapper(
    "action",
    "getClientBlockersAction",
    () => getClientBlockersAction(slug),
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new AppError(
      error.message || "Não foi possível recuperar as métricas de backlog",
    );
  }

  return success;
});
