import { LineChart, LineChartCategory } from "@/components/Charts/LineChart";
import { getTranslations } from "next-intl/server";
import { getCachedSprintMetrics } from "../_data/get-cached-sprint-metrics";

interface IBacklogBurndownLineChart {
  slug: string;
}

export async function BacklogBurndownLineChart({
  slug,
}: IBacklogBurndownLineChart) {
  const t = await getTranslations("projects.dashboard.charts.burndown");
  const metrics = await getCachedSprintMetrics(slug);

  const categories: LineChartCategory[] = [
    {
      key: "ideal",
      label: t("ideal"),
      color: "hsl(var(--muted-foreground))",
      dashed: true,
    },
    {
      key: "real",
      label: t("real"),
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <LineChart
      title={t("title")}
      description={t("description")}
      data={metrics.burndown}
      indexKey="day"
      categories={categories}
    />
  );
}
