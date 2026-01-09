import { AppError } from "@/errors/AppError";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getSonarQubeHistoryAction } from "@/actions/integrations/getSonarQubeHistoryAction";

// Esta é a função única que todos os componentes vão importar
export const getCachedSonarHistory = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: any;
    message?: string;
  }>(
    "action",
    "getSonarQubeHistoryAction",
    () => {
      return getSonarQubeHistoryAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new AppError("Não foi possível recuperar a métricas históricas");
  }

  return success;
});
