import { ChartCategory } from "@/components/Charts/AreaLineChart";
import { getTranslations } from "next-intl/server";
import { getCachedSprintMetrics } from "../_data/get-cached-sprint-metrics";
import { BarChart } from "@/components/Charts/BarChart";

interface ISprintProgressBarChart {
  slug: string;
}

export async function SprintProgressBarChart({
  slug,
}: ISprintProgressBarChart) {
  const t = await getTranslations("projects.dashboard.charts.sprint");
  const metrics = await getCachedSprintMetrics(slug);

  const categories: ChartCategory[] = [
    {
      key: "planned",
      label: t("planned"),
      color: "hsl(var(--muted-foreground) / 0.5)",
    },
    {
      key: "completed",
      label: t("completed"),
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <BarChart
      title={t("title")}
      description={t("description")}
      data={metrics.history}
      indexKey="name"
      categories={categories}
      height={250}
    />
  );
}
