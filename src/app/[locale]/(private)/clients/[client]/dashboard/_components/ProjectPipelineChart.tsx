import { DonutChart } from "@/components/Charts/DonutChart";
import { getClientProjectPipeline } from "../_data/get-cached-project-pipeline";
import { getTranslations } from "next-intl/server";
import { PIPELINE_CATEGORY_BY_STATUS } from "@/mappers/projectStageMapper";
import { ProjectStatus } from "@/generated/prisma/enums";

interface IProjectPipelineChart {
  slug: string;
}

export async function ProjectPipelineChart({ slug }: IProjectPipelineChart) {
  const t = await getTranslations("projects.status");
  const tChart = await getTranslations("clients.dashboard.charts.pipeline");
  const rawData = await getClientProjectPipeline(slug);

  const aggregated = rawData.reduce(
    (acc, item) => {
      const category =
        PIPELINE_CATEGORY_BY_STATUS[item.status as ProjectStatus] ??
        "notStarted";
      acc[category] = (acc[category] ?? 0) + item.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(aggregated).map(([category, count]) => ({
    name: t(category as "notStarted"),
    value: count,
  }));

  const colors: Record<string, string> = {
    [t("inProgress")]: "hsl(var(--chart-1))",
    [t("completed")]: "hsl(var(--chart-2))",
    [t("negotiation")]: "hsl(var(--chart-3))",
    [t("paused")]: "hsl(var(--chart-4))",
    [t("notStarted")]: "hsl(var(--chart-5))",
  };

  return (
    <DonutChart
      title={tChart("title")}
      description={tChart("description")}
      data={chartData}
      colors={colors}
      height={350}
    />
  );
}
