import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ProjectNotesForm } from "./ProjectNotesForm";
import { ProjectNotes } from "./ProjectNotes";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { hasAnyPermission } from "@/utils/hasPermission";

interface IProjectNotesContainer {
  project: ProjectWithDetails;
}

export async function ProjectNotesContainer({
  project,
}: IProjectNotesContainer) {
  const session = await auth();
  const canManage = hasAnyPermission(session?.user, [
    PERMISSIONS.PROJECT.CREATE,
    PERMISSIONS.PROJECT.MANAGE,
  ]);
  return (
    <Card className="lg:col-span-2 h-full max-h-[800px] flex flex-col">
      <CardHeader>
        <CardTitle>Observações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && <ProjectNotesForm projectId={project.id} />}
        <Separator />
        <ProjectNotes project={project} query="" />
      </CardContent>
    </Card>
  );
}
