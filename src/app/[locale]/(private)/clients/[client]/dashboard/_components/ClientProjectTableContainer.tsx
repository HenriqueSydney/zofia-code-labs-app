import { operationWrapper } from "@/lib/operationWrapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchProjects } from "@/actions/projects/fetchProjects";
import { AppError } from "@/errors/AppError";
import { ClientProjectTable } from "./ClientProjectTable";

interface IClientProjectTableContainer {
  slug: string;
}

export async function ClientProjectTableContainer({
  slug,
}: IClientProjectTableContainer) {
  const [fetchProjectsError, fetchProjectsSuccess] = await operationWrapper<{
    totalOfRegisters: number;
    projects: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
  }>(
    "action",
    "fetchProjects",
    () => {
      return fetchProjects(
        { clientSlug: slug },
        { page: 1, numberPerPage: 10 },
      );
    },
    {
      cache: "no-cache",
    },
  );

  if (fetchProjectsError) {
    throw new AppError(fetchProjectsError.message);
  }

  // 2. Renderiza a Tabela
  return <ClientProjectTable data={fetchProjectsSuccess.projects} />;
}
