import { getParams } from "@/utils/getParams";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectAction } from "@/actions/projects/getProject";
import { AppError } from "@/errors/AppError";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { StatsCard } from "@/components/StatsCard";
import { ProjectTabs } from "./components/ProjectTabs";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const { projectId } = await getParams<{
    projectId: string;
  }>(params, ["projectId"]);

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
    <div className="space-y-6 mb-6">
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
      <ProjectTabs>{children}</ProjectTabs>
    </div>
  );
}
