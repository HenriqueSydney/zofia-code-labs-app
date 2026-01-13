import { AppError } from "@/errors/AppError";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getFinancialMetricsAction } from "@/actions/financial/getFinancialMetricsAction";

// 3. Busca de Métricas Financeiras (Cards e Linha)
export const getCachedFinancialMetrics = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: any;
    message?: string;
  }>(
    "action",
    "getFinancialMetricsAction",
    () => getFinancialMetricsAction(slug),
    { cache: "no-cache" }
  );

  if (error || !success?.success || !success?.data) {
    throw new AppError(
      success?.message || "Não foi possível recuperar as métricas financeiras"
    );
  }
  return success.data;
});
