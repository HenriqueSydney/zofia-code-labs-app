import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Link } from "@/i18n/navigation";
import { fetchProjects } from "@/actions/projects/fetchProjects";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { ProjectList } from "@/components/ProjectList";
import { QueryFilter } from "@/components/QueryFilter";
import { TabsContent } from "@/components/ui/tabs";

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
    },
  );

  if (fetchProjectsError) {
    throw new AppError(fetchProjectsError.message);
  }

  return (
    <TabsContent value="projects" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Projetos</CardTitle>
            <CardDescription>
              Gerencie todos os projetos da empresa
            </CardDescription>
          </div>

          <Link href={`/clients/${clientSlug}/projects/new-project/form`}>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <QueryFilter placeholder="Buscar projetos por nome..." />

            <ProjectList
              projects={fetchProjectsSuccess.projects}
              totalOfRegister={fetchProjectsSuccess.totalOfRegisters}
            />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default Projects;
