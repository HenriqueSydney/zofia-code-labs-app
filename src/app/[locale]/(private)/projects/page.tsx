import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { fetchProjects } from "@/actions/projects/fetchProjects";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ProjectList } from "./components/ProjectList";
import { QueryFilter } from "@/components/QueryFilter";

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}
const Projects = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [fetchProjectsError, fetchProjectsSuccess] = await operationWrapper<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices">[];
  }>(
    "action",
    "fetchProjects",
    () => {
      return fetchProjects(query, { page: 1, numberPerPage: 10 });
    },
    {
      cache: "no-cache",
    }
  );

  if (fetchProjectsError) {
    throw new AppError("Erro ao tentar localizar os projetos da Organização");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Projetos"
          description="Gerencie todos os projetos da empresa"
        />

        <Link href={`/projects/new-project`}>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <QueryFilter placeholder="Buscar projetos por nome ou cliente..." />

      <ProjectList projects={fetchProjectsSuccess.projects} />

      {fetchProjectsSuccess.totalOfRegisters === 0 && (
        <div className="text-center text-muted-foreground py-12">
          Nenhum projeto encontrado
        </div>
      )}
    </div>
  );
};

export default Projects;
