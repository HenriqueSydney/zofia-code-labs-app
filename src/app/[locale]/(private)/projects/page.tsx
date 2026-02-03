import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
}
const Projects = async ({ searchParams }: IParams) => {
  const {
    query,
    page = 1,
    numberPerPage = 10,
  } = await getParams(searchParams, ["query", "page", "numberPerPage"]);

  const [fetchProjectsError, fetchProjectsSuccess] = await operationWrapper<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }>(
    "action",
    "fetchProjects",
    () => {
      return fetchProjects(query, { page, numberPerPage });
    },
    {
      cache: "no-cache",
    },
  );

  if (fetchProjectsError) {
    throw new AppError(fetchProjectsError.message);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Projetos"
        description="Gerencie todos os projetos da empresa"
      />
      <QueryFilter placeholder="Buscar projetos por nome ou cliente..." />

      <ProjectList
        projects={fetchProjectsSuccess.projects}
        totalOfRegister={fetchProjectsSuccess.totalOfRegisters}
      />
    </div>
  );
};

export default Projects;
