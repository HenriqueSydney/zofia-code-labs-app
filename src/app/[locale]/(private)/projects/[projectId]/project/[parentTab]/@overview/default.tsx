import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ProjectNotes } from "./ProjectNotes";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ProjectNotesForm } from "./ProjectNotesForm";
import ProjectDocuments from "./ProjectDocuments";
import ProjectActivityLog from "./ProjectActivityLog";
import ProjectTimeline from "./ProjectTimeline";
import { operationWrapper } from "@/lib/operationWrapper";
import { FetchServiceTypeWithCategory } from "@/repositories/IServiceTypeRepository";
import { fetchServiceTypeAction } from "@/actions/services/fetchServiceTypeAction";
import { getProjectAction } from "@/actions/projects/getProject";
import { getParams } from "@/utils/getParams";
import { AppError } from "@/errors/AppError";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";

interface IOverviewTab {
  params: Promise<{ projectId: string }>;
}

export default async function OverviewTab({ params }: IOverviewTab) {
  const { projectId } = await getParams<{
    projectId: string;
  }>(params, ["projectId"]);

  const [projectResponse, serviceResponse] = await Promise.all([
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
    operationWrapper<{
      serviceTypes: FetchServiceTypeWithCategory[];
    }>(
      "action",
      "fetchServiceTypeAction",
      () => {
        return fetchServiceTypeAction();
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [getProjectError, getProjectSuccess] = projectResponse;

  if (getProjectError) {
    throw new AppError("Erro ao tentar localizar os projetos da Organização");
  }

  const [fetchServicesError, fetchServicesSuccess] = serviceResponse;

  const project = getProjectSuccess.project;
  const services = fetchServicesError ? [] : fetchServicesSuccess.serviceTypes;
  let contextualData: any = services;
  if (project.status === "PROPOSAL") {
    const [proposalError, proposalSuccess] =
      await operationWrapper<ProposalWithDetails>(
        "action",
        "getProposalAction",
        () => {
          return getProposalAction(project.proposal.id);
        },
        {
          cache: "no-cache",
        }
      );

    if (!proposalError && proposalSuccess) contextualData = proposalSuccess;
  }

  return (
    <TabsContent value="overview" className="space-y-6 mt-6">
      {/* Summary Section */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full max-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Sumário do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto space-y-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
            {project.projectServices.length > 0 && (
              <>
                <hr />
                <p className="font-medium">Serviços associados ao projeto: </p>
                <ul className="ml-10 list-disc text-muted-foreground">
                  {project.projectServices.map((service) => (
                    <li key={service.serviceTypeId}>
                      {service.serviceType.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <ProjectDocuments project={project} />
      </div>
      <ProjectTimeline project={project} contextData={contextualData} />

      {/* Observations Section */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-full max-h-[800px] flex flex-col">
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Observation */}
            <ProjectNotesForm projectId={project.id} />
            {/* Observations List */}
            <ProjectNotes project={project} query="" />
          </CardContent>
        </Card>

        <ProjectActivityLog />
      </div>
    </TabsContent>
  );
}
