import { SectionHeading } from "@/components/SectionHeading";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { TabsTrigger } from "@radix-ui/react-tabs";
import { ArrowLeft, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { OverviewTab } from "./components/OverviewTab";
import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { getProjectAction } from "@/actions/projects/getProject";

interface IProjectDashboardPage {
  params?: Promise<{ params: string }>;
}

export default async function ProjectDashboard({
  params,
}: IProjectDashboardPage) {
  const { projectId } = await getParams(params, ["projectId"]);
  const session = await auth();
  if (!session) throw new AppError("Usuário não atenticado");
  if (!projectId) throw new AppError("Projeto não localizado");

  const [getProjectError, getProjectSuccess] = await operationWrapper<{
    project: ProjectWithDetails;
  }>(
    "action",
    "fetchProjectNotes",
    () => {
      return getProjectAction(projectId);
    },
    {
      cache: "no-cache",
    }
  );

  if (getProjectError) {
    throw new AppError("Erro ao tentar localizar os projetos da Organização");
  }

  const project = getProjectSuccess.project;

  return (
    <div className="space-y-6">
      <div className="flex gap-10">
        <Link href="/projects" prefetch={false}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <SectionHeading
          title={project.name}
          description={`Cliente: ${project.client.companyName}`}
        />
        <div className="flex h-full mt-2">
          <StatusBadge status="inProgress" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Prazo" mainInformation="25/05/2025" Icon={Calendar} />
        <StatsCard
          label="Orçamento"
          mainInformation="R$ 100.000,00"
          Icon={DollarSign}
          iconColor="bg-accent/10"
        />
        <StatsCard label="Equipe" mainInformation="2" Icon={Users} />
        <StatsCard
          label="Progresso"
          mainInformation="70%"
          Icon={Clock}
          iconColor="bg-accent/10"
        />
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full h-full flex-col md:flex-row flex mb-2  items-center !justify-evenly glass-effect">
          <TabsTrigger className="cursor-pointer w-full" value="overview">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer w-full" value="dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer w-full" value="backlog">
            Backlog
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer w-full" value="timeline">
            Prazos
          </TabsTrigger>
        </TabsList>
        <OverviewTab project={project} />
      </Tabs>
    </div>
  );
}
