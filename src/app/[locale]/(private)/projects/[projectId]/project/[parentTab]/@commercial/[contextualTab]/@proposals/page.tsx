import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@radix-ui/react-tabs";
import { CreateNewProposalButton } from "./CreateNewProposalButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchProposalHistory } from "@/actions/proposal/fetchProposalHistory";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { getProposalStatusBadge } from "@/mappers/proposalStatusBadge";
import { CheckCircle, Download, Eye, FileEdit, Send, User } from "lucide-react";
import { date } from "@/lib/dayjs";
import { ProposalDetailsModal } from "./ProposalDetailsModal";
import { ToastComponent } from "./ToastComponent";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectAction } from "@/actions/projects/getProject";
import { AppError } from "@/errors/AppError";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { Link } from "@/i18n/navigation";

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
      "fetchProjectNotes",
      () => {
        return getProjectAction(projectId);
      },
      {
        cache: "no-cache",
      }
    ),
    operationWrapper<ProposalWithDetails[]>(
      "action",
      "fetchProjectNotes",
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
      <ToastComponent />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Propostas</CardTitle>
          <CreateNewProposalButton project={project} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historySuccess.map((proposal) => (
              <div
                key={proposal.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {proposal.proposalTemplate?.template && (
                        <h4 className="font-medium">
                          {proposal.proposalTemplate?.template?.title}
                        </h4>
                      )}
                      <Badge variant="outline">
                        Versão: {proposal.version}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-primary mt-1">
                      {formatCurrency(Number(proposal.totalValue))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getProposalStatusBadge(proposal.status)}
                    <ProposalDetailsModal proposal={proposal} />
                    <Link href={proposal.id}>
                      <Button variant="ghost" size="icon">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2 border-t">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> Criado por
                    </p>
                    {proposal.createdUser && (
                      <p className="font-medium">
                        {proposal.createdUser?.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {date(proposal.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                  {proposal.reviewedBy && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Revisado por
                      </p>
                      <p className="font-medium">{proposal.reviewedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {date(proposal.reviewedAt!).format("DD/MM/YYYY HH:mm")}
                      </p>
                    </div>
                  )}
                  {proposal.approvedBy && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Aprovado por
                      </p>
                      <p className="font-medium">{proposal.approvedBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {date(proposal.approvedAt!).format("DD/MM/YYYY HH:mm")}
                      </p>
                    </div>
                  )}
                  {proposal.status === "SENT" && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Send className="h-3 w-3" /> Proposta enviada para o
                        client
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
