import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { Pencil } from "lucide-react";

interface IProjectSummary {
  project: ProjectWithDetails;
}

export function ProjectSummary({ project }: IProjectSummary) {
  return (
    <Card className="lg:col-span-2 h-full min-h-[400px] max-h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sumário do Projeto</CardTitle>
        <Link
          href={`/clients/${project.client.slug}/projects/${project.slug}/form`}
        >
          <Button variant="ghost">
            <Pencil className="w-4 h-4" />
            Editar Sumário
          </Button>
        </Link>
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
                <li key={service.serviceTypeId}>{service.serviceType.name}</li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
