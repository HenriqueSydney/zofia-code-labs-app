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
import { Tooltip } from "@/components/Tooltip";

interface IOverviewTab {
  project: ProjectWithDetails;
}

export async function OverviewTab({ project }: IOverviewTab) {
  const [fetchServicesError, fetchServicesSuccess] = await operationWrapper<{
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
  );

  const services = fetchServicesError ? [] : fetchServicesSuccess.serviceTypes;
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
      <ProjectTimeline project={project} contextData={services} />

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
