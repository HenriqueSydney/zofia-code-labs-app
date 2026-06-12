import { getParams } from "@/utils/getParams";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { StatusBadge } from "@/components/StatusBadge";
import { StatsCard } from "@/components/StatsCard";
import { ProjectTabs } from "./_components/ProjectTabs";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { operationWrapper } from "@/lib/operationWrapper";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { ValidationError } from "@/errors";
import { GoBackButton } from "@/components/GoBackButton";
import { date } from "@/lib/dayjs";
import { formatCurrency } from "@/utils/formatCurrency";
import { getProjectHealthBadge } from "@/mappers/projectHealthMapper";
import { getTranslations } from "next-intl/server";

interface LayoutProps {
  overview: React.ReactNode;
  dashboard: React.ReactNode;
  commercial: React.ReactNode;
  backlog: React.ReactNode;
  metrics: React.ReactNode;
  params: Promise<{ parentTab: string }>;
}

export default async function ProjectLayout({
  overview,
  dashboard,
  commercial,
  backlog,
  metrics,
  params,
}: LayoutProps) {
  const tHealth = await getTranslations("projects");
  const tLayout = await getTranslations("projects.layout");
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
    },
  );

  if (getProjectError) {
    throw new ValidationError(tLayout("fetchError"));
  }

  const project = getProjectSuccess.project;

  const getDateDescription = (project: ProjectWithDetails) => {
    const startDate = project.startDate
      ? date(project.startDate)
      : date(project.estimatedStartDate);

    const endDate = project.endDate
      ? date(project.endDate).format("DD/MM/YYYY")
      : undefined;

    if (endDate && startDate.isBefore(date())) {
      return {
        label: tLayout("deadlineLabel"),
        mainInformation: endDate,
        description: tLayout("scheduledStart", {
          date: startDate.format("DD/MM/YYYY"),
        }),
      };
    }

    return {
      label: project.startDate ? tLayout("start") : tLayout("estimatedStart"),
      mainInformation: startDate.format("DD/MM/YYYY"),
      description: endDate,
    };
  };

  const getBudgetIndicator = (project: ProjectWithDetails) => {
    const totalBudget = Number(project.totalBudget);
    const totalSpent = Number(project.totalSpent);

    // Evita divisão por zero se o budget for 0
    if (totalBudget === 0) return "text-gray-500";

    const percentage = (totalSpent / totalBudget) * 100;

    if (percentage > 90) return "bg-red-600/20"; // Crítico (> 90%)
    if (percentage > 80) return "bg-orange-500/20"; // Alto Risco (> 80%)
    if (percentage > 70) return "bg-yellow-600/20"; // Atenção (> 70%)

    return "bg-green-600/20"; // Saudável (< 70%)
  };

  const deadlineCard = getDateDescription(project);

  return (
    <div className="space-y-6 mb-6">
      <div className="flex gap-5 items-start">
        <GoBackButton withLabel={false} className="mt-2" />
        <SectionHeading
          title={project.name}
          description={tLayout("clientLabel", {
            name: project.client.companyName,
          })}
        />
        <div className="flex h-full mt-2">
          <StatusBadge status={getProjectSuccess.project.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label={deadlineCard.label}
          mainInformation={deadlineCard.mainInformation}
          description={deadlineCard.description}
          Icon={Calendar}
        />
        <StatsCard
          label={tLayout("budget")}
          mainInformation={
            project.totalBudget
              ? formatCurrency(project.totalBudget)
              : "R$ ---,--"
          }
          Icon={DollarSign}
          description={
            project.remainingBudget
              ? tLayout("balance", {
                  amount: formatCurrency(project.remainingBudget),
                })
              : tLayout("balance", {
                  amount: formatCurrency(project.totalBudget),
                })
          }
          iconColor={getBudgetIndicator(project)}
        />
        <StatsCard label={tLayout("team")} mainInformation="2" Icon={Users} />
        <StatsCard
          label={tLayout("progress")}
          mainInformation="70%"
          Icon={Clock}
          iconColor="bg-accent/10"
          badge={getProjectHealthBadge(
            project.health,
            (key) => tHealth(key as "health.HEALTHY" | "health.AT_RISK" | "health.DELAYED"),
          )}
        />
      </div>
      <ProjectTabs>
        {parentTab === "overview" && overview}
        {parentTab === "dashboard" && dashboard}
        {parentTab === "commercial" && commercial}
        {parentTab === "backlog" && backlog}
        {parentTab === "metrics" && metrics}
      </ProjectTabs>
    </div>
  );
}
