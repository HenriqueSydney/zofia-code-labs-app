import { DonutChart } from "@/components/Charts/DonutChart";
import { getTranslations } from "next-intl/server";
import { getCachedBacklogMetrics } from "../_data/get-cached-backlog-metrics";

const BACKLOG_STATUS_COLORS: Record<string, string> = {
  todo: "hsl(var(--muted-foreground))",
  inProgress: "hsl(var(--accent))",
  review: "hsl(var(--primary))",
  done: "#16a34a",
  canceled: "#dc2626",
  waitingClient: "#ca8a04",
};

export async function BacklogStatusDonutChart({ slug }: { slug: string }) {
  const t = await getTranslations("projects.dashboard.charts.backlogStatus");
  const tStatus = await getTranslations("projects.backlog.status");
  const metrics = await getCachedBacklogMetrics(slug);

  const chartData = metrics.chartData.map((item: { name: string; value: number }) => ({
    name: tStatus(item.name as never),
    value: item.value,
  }));

  const colors = Object.fromEntries(
    metrics.chartData.map((item: { name: string; value: number }) => [
      tStatus(item.name as never),
      BACKLOG_STATUS_COLORS[item.name] ?? "hsl(var(--muted-foreground))",
    ]),
  );

  return (
    <DonutChart
      title={t("title")}
      description={t("description")}
      data={chartData}
      colors={colors}
      height={300}
    />
  );
}
