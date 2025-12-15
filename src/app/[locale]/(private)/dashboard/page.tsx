import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, FolderKanban, CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TotalProjectPerMonth } from "./components/TotalProjectPerMonth";
import { ProjectGrowthOverTime } from "./components/ProjectGrowthOverTime";
import { Table } from "@/components/Table";
import { StatsCard } from "./components/StatsCard";
import { SectionHeading } from "@/components/SectionHeading";
type ProjectStatus = "completed" | "inProgress" | "planning";

const Dashboard = async () => {
  const t = await getTranslations("admin");
  const stats = [
    {
      title: t("stats.totalProjects"),
      value: "24",
      icon: FolderKanban,
      trend: "+12%",
    },
    {
      title: t("stats.activeProjects"),
      value: "8",
      icon: TrendingUp,
      trend: "+3",
    },
    {
      title: t("stats.completedProjects"),
      value: "16",
      icon: CheckCircle2,
      trend: "67%",
    },
    {
      title: t("stats.clientSatisfaction"),
      value: "98%",
      icon: Users,
      trend: "+5%",
    },
  ];

  const projectData = [
    { month: "Jan", projects: 2 },
    { month: "Feb", projects: 3 },
    { month: "Mar", projects: 4 },
    { month: "Apr", projects: 3 },
    { month: "May", projects: 5 },
    { month: "Jun", projects: 7 },
  ];

  const getStatusBadge = (status: ProjectStatus) => {
    const variants: Record<ProjectStatus, "default" | "secondary" | "outline"> =
      {
        completed: "default",
        inProgress: "secondary",
        planning: "outline",
      };
    return <Badge variant={variants[status]}>{t(`statuses.${status}`)}</Badge>;
  };

  const recentProjects = [
    {
      name: { value: "E-Commerce Platform" },
      status: { value: "completed" },
      date: { value: "2024-01-15" },
      client: { value: "RetailCo" },
    },
    {
      name: { value: "Cloud Dashboard" },
      status: { value: getStatusBadge("inProgress") },
      date: { value: "2024-02-20" },
      client: { value: "TechStart" },
    },
    {
      name: { value: "Mobile Banking App" },
      status: { value: getStatusBadge("completed") },
      date: { value: "2024-01-30" },
      client: { value: "FinanceHub" },
    },
    {
      name: { value: "Healthcare Portal" },
      status: { value: getStatusBadge("inProgress") },
      date: { value: "2024-03-10" },
      client: { value: "MedTech" },
    },
    {
      name: { value: "Logistics System" },
      status: { value: getStatusBadge("planning") },
      date: { value: "2024-03-25" },
      client: { value: "ShipFast" },
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading title={t("overview")} description={t("description")} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("chart.projectPerMonth.title")}</CardTitle>
            <CardDescription>
              {t("chart.projectPerMonth.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TotalProjectPerMonth projectData={projectData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle> {t("chart.projectPerMonth.title")}</CardTitle>
            <CardDescription>
              {" "}
              {t("chart.projectPerMonth.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectGrowthOverTime projectData={projectData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("projectHistory")}</CardTitle>
          <CardDescription>
            Recent projects and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table tableId="recent_projects" data={recentProjects} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
