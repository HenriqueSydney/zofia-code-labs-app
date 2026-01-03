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
import { ProjectList } from "@/components/ProjectList";
import { QueryFilter } from "@/components/QueryFilter";

interface IParams {
  searchParams: Promise<{
    query?: string;
    page?: number;
    numberPerPage?: number;
  }>;
  params: Promise<{ client: string }>;
}
const Projects = async ({ searchParams, params }: IParams) => {
  const {
    query,
    page = 1,
    numberPerPage = 10,
  } = await getParams(searchParams, ["query", "page", "numberPerPage"]);
  const { client: clientSlug } = await params;

  const [fetchProjectsError, fetchProjectsSuccess] = await operationWrapper<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }>(
    "action",
    "fetchProjects",
    () => {
      return fetchProjects({ query, clientSlug }, { page, numberPerPage });
    },
    {
      cache: "no-cache",
    }
  );

  if (fetchProjectsError) {
    throw new AppError(fetchProjectsError.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Projetos"
          description="Gerencie todos os projetos da empresa"
        />

        <Link href={`/clients/${clientSlug}/projects/new-project`}>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <QueryFilter placeholder="Buscar projetos por nome..." />

      <ProjectList
        projects={fetchProjectsSuccess.projects}
        totalOfRegister={fetchProjectsSuccess.totalOfRegisters}
      />
    </div>
  );
};

export default Projects;
