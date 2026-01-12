import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { date } from "@/lib/dayjs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { ProjectDocumentsActions } from "./ProjectDocumentsAction";
import { ProjectDocumentsAddAction } from "./ProjectDocumentsAddAction";
import { EmptyState } from "@/components/EmptyState";
import { File } from "lucide-react";

interface IProjectDocuments {
  project: ProjectWithDetails;
}

const ProjectDocuments = ({ project }: IProjectDocuments) => {
  const documents = project.projectDocuments;

  return (
    <Card className="lg:col-span-1 h-full max-h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Documentos</CardTitle>
          <ProjectDocumentsAddAction projectId={project.id} />
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1 min-h-0">
        <div className="space-y-2">
          {documents.length === 0 && (
            <EmptyState
              title="Documentos"
              description="Nenhum documento anexado até o momento"
              icon={File}
              action={
                <ProjectDocumentsAddAction
                  projectId={project.id}
                  variant="default"
                />
              }
            />
          )}
          {documents.map((doc) => {
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <AttachmentIcon extension={doc.extension} />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date(doc.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                </div>
                <ProjectDocumentsActions projectDocument={doc} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDocuments;
