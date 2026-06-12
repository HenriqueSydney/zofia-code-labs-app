import { ValidationError } from "@/errors";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getClientDeliveryEvolutionAction } from "@/actions/clients/getClientDeliveryEvolutionAction";
import { getClientProjectPipelineAction } from "@/actions/clients/getClientProjectPipelineAction";

// 1. Busca de Métricas de Backlog (Cards e Donut)
export const getClientProjectPipeline = cache(async (slug: string) => {
  const [error, success] = await operationWrapper(
    "action",
    "getClientProjectPipelineAction",
    () => getClientProjectPipelineAction(slug),
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new ValidationError(error.message);
  }

  return success;
});
