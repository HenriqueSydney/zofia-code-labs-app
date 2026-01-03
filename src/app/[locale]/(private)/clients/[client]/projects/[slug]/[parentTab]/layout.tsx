import { getParams } from "@/utils/getParams";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { StatsCard } from "@/components/StatsCard";
import { ProjectTabs } from "./components/ProjectTabs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { AppError } from "@/errors/AppError";

interface LayoutProps {
  overview: React.ReactNode;
  commercial: React.ReactNode;
  backlog: React.ReactNode;
  params: Promise<{ parentTab: string }>;
}

export default async function ProjectLayout({
  overview,
  commercial,
  backlog,
  params,
}: LayoutProps) {
  const { slug, parentTab } = await getParams<{
    slug: string;
    parentTab: string;
  }>(params, ["slug", "parentTab"]);

  const [getProjectError, getProjectSuccess] = await operationWrapper<{
    project: ProjectWithDetails;
  }>(
    "action",
    "getProjectBySlugAction",
    () => {
      return getProjectBySlugAction(slug);
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
          <StatusBadge status={getProjectSuccess.project.status} />
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
      <ProjectTabs>
        {parentTab === "overview" && overview}
        {parentTab === "commercial" && commercial}
        {parentTab === "backlog" && backlog}
      </ProjectTabs>
    </div>
  );
}
