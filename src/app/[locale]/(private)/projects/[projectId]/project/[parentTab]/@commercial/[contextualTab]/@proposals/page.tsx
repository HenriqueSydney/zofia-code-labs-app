import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { CreateNewProposalButton } from "../@proposals/CreateNewProposalButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchProposalHistory } from "@/actions/proposal/fetchProposalHistory";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectAction } from "@/actions/projects/getProject";
import { AppError } from "@/errors/AppError";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { ProposalHistoryList } from "./ProposalHistoryList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface IProposalTab {
  params: Promise<{ projectId: string; contextualTab: string }>;
}

export default async function ProposalTab({ params }: IProposalTab) {
  const { projectId } = await getParams<{ projectId: string }>(params, [
    "projectId",
  ]);
  const [projectResponse, proposalHistoryResponse] = await Promise.all([
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
    operationWrapper<ProposalWithDetails[]>(
      "action",
      "fetchProposalHistory",
      () => {
        return fetchProposalHistory(projectId);
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [projectError, projectSuccess] = projectResponse;
  const [historyError, historySuccess] = proposalHistoryResponse;

  if (projectError) throw new AppError("Falha ao tentar localizar o projeto");
  if (historyError) {
    throw new AppError("Falha ao tentar localizar o histórico de propostas");
  }

  const project = projectSuccess.project;

  return (
    <TabsContent value="proposals" className="mt-6">
      <SuccessToastComponent />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Propostas</CardTitle>
          <CreateNewProposalButton project={project} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historySuccess.map((proposal) => (
              <ProposalHistoryList
                key={proposal.id}
                proposal={proposal}
                project={project}
              />
            ))}

            {historySuccess.length === 0 && (
              <div className="flex items-center justify-center my-6">
                <Alert className="bg-accent/10 border-accent/30 w-full max-w-4xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhuma proposta localizada</AlertTitle>
                  <AlertDescription>
                    Nenhuma proposta cadastrada até o momento. Siga o fluxo do
                    projeto para criar uma a partir de um template ou anexe a
                    proposta para encaminhamento para assinatura
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
