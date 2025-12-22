import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { CreateNewContractButton } from "../@contracts/CreateNewContractButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchContractHistory } from "@/actions/contract/fetchContractHistory";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectAction } from "@/actions/projects/getProject";
import { AppError } from "@/errors/AppError";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { ContractHistoryList } from "../@contracts/ContractHistoryList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface IContractTab {
  params: Promise<{ projectId: string; contextualTab: string }>;
}

export default async function ContractTab({ params }: IContractTab) {
  const { projectId } = await getParams<{ projectId: string }>(params, [
    "projectId",
  ]);
  const [projectResponse, contractHistoryResponse] = await Promise.all([
    operationWrapper<{
      project: ProjectWithDetails;
    }>(
      "action",
      "getProjectAction",
      () => {
        return getProjectAction(projectId);
      },
      {
        cache: "no-cache",
      }
    ),
    operationWrapper<ContractWithDetails[]>(
      "action",
      "fetchContractHistory",
      () => {
        return fetchContractHistory(projectId);
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [projectError, projectSuccess] = projectResponse;
  const [historyError, historySuccess] = contractHistoryResponse;

  if (projectError) throw new AppError("Falha ao tentar localizar o projeto");
  if (historyError) {
    throw new AppError("Falha ao tentar localizar o histórico de contratos");
  }

  const project = projectSuccess.project;

  return (
    <TabsContent value="contracts" className="mt-6">
      <SuccessToastComponent />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Contratos</CardTitle>
          <CreateNewContractButton project={project} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historySuccess.map((contract) => (
              <ContractHistoryList
                key={contract.id}
                contract={contract}
                project={project}
              />
            ))}
            {historySuccess.length === 0 && (
              <div className="flex items-center justify-center my-6">
                <Alert className="bg-accent/10 border-accent/30 w-full max-w-4xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhum contrato localizado</AlertTitle>
                  <AlertDescription>
                    Nenhum contrato cadastrado até o momento. Siga o fluxo do
                    projeto para criar um a partir de um template ou anexe o
                    contrato para encaminhamento para assinatura
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
