import { ValidationError } from "@/errors";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getClientDeliveryEvolutionAction } from "@/actions/clients/getClientDeliveryEvolutionAction";

// 1. Busca de Métricas de Backlog (Cards e Donut)
export const getClientDeliveryEvolution = cache(async (slug: string) => {
  const [error, success] = await operationWrapper(
    "action",
    "getClientDeliveryEvolutionAction",
    () => getClientDeliveryEvolutionAction(slug),
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new ValidationError(error.message || "Não foi possível recuperar as métricas de backlog");
  }

  return success;
});
