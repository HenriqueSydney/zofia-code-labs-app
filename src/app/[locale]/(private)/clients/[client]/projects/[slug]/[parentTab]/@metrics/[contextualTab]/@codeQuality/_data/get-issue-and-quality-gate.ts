import { ValidationError } from "@/errors";
import { cache } from "react";
import { operationWrapper } from "@/lib/operationWrapper";
import { getSonarQubeIssueAndQualityGateAction } from "@/actions/integrations/sonarqube/getSonarQubeIssueAndQualityGateAction";
// Esta é a função única que todos os componentes vão importar
export const getCachedSonarIssueAndQualityGate = cache(async (slug: string) => {
  const [error, success] = await operationWrapper<{
    success: boolean;
    data?: any;
    message?: string;
  }>(
    "action",
    "getSonarQubeIssueAndQualityGateAction",
    () => {
      return getSonarQubeIssueAndQualityGateAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new ValidationError("Não foi possível recuperar as Issues e o Quality Gate aplicado");
  }

  return success;
});
