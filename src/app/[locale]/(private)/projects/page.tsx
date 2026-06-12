import { SectionHeading } from "@/components/SectionHeading";
import { fetchProjects } from "@/actions/projects/fetchProjects";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { ValidationError } from "@/errors";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ProjectList } from "@/components/ProjectList";
import { QueryFilter } from "@/components/QueryFilter";
import { getTranslations } from "next-intl/server";

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

  const [[fetchProjectsError, fetchProjectsSuccess], t] = await Promise.all([
    operationWrapper<{
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
    ),
    getTranslations("projects.page"),
  ]);

  if (fetchProjectsError) {
    throw new ValidationError(fetchProjectsError.message);
  }

  return (
    <div className="space-y-6">
      <SectionHeading title={t("title")} description={t("description")} />
      <QueryFilter placeholder={t("searchPlaceholder")} />

      <ProjectList
        projects={fetchProjectsSuccess.projects}
        totalOfRegister={fetchProjectsSuccess.totalOfRegisters}
      />
    </div>
  );
};

export default Projects;
