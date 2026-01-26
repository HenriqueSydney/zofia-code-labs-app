import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ProjectNotesForm } from "./ProjectNotesForm";
import { ProjectNotes } from "./ProjectNotes";
import { Separator } from "@/components/ui/separator";

interface IProjectNotesContainer {
  project: ProjectWithDetails;
}

export function ProjectNotesContainer({ project }: IProjectNotesContainer) {
  return (
    <Card className="lg:col-span-2 h-full max-h-[800px] flex flex-col">
      <CardHeader>
        <CardTitle>Observações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProjectNotesForm projectId={project.id} />
        <Separator />
        <ProjectNotes project={project} query="" />
      </CardContent>
    </Card>
  );
}
