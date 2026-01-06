import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { CreateNewProposalButton } from "./CreateNewProposalButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchProposalHistory } from "@/actions/proposal/fetchProposalHistory";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { ProposalHistoryList } from "./ProposalHistoryList";
import { FileClock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";

interface IProposalTab {
  params: Promise<{ slug: string; contextualTab: string }>;
}

export default async function ProposalTab({ params }: IProposalTab) {
  const { slug } = await getParams<{ slug: string }>(params, ["slug"]);
  const [projectError, projectSuccess] = await operationWrapper<{
    project: ProjectWithDetails;
  }>(
    "action",
    "getProjectAction",
    () => {
      return getProjectBySlugAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (projectError) throw new AppError("Falha ao tentar localizar o projeto");

  const project = projectSuccess.project;

  const [historyError, historySuccess] = await operationWrapper<
    ProposalWithDetails[]
  >(
    "action",
    "fetchProposalHistory",
    () => {
      return fetchProposalHistory(project.id);
    },
    {
      cache: "no-cache",
    }
  );

  if (historyError) {
    throw new AppError("Falha ao tentar localizar o histórico de propostas");
  }

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
              <EmptyState
                title="Nenhuma proposta cadastrada"
                icon={FileClock}
                description="Nenhuma proposta cadastrada até o momento. Avance o projeto até a fase de proposta para cadastrar a primeira proposta."
              />
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
