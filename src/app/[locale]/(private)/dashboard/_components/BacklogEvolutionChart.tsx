import { getBacklogEvolutionChartAction } from "@/actions/stats/getBacklogEvolutionChartAction";
import { AreaLineChart } from "@/components/Charts/AreaLineChart";
import { getTranslations } from "next-intl/server";

export async function BacklogEvolutionChart() {
  const t = await getTranslations("admin.chart.backlogEvolution");
  const { data } = await getBacklogEvolutionChartAction();

  if (!data) return null;

  return (
    <div className="col-span-4">
      <AreaLineChart
        title={t("title")}
        description={t("description")}
        data={data}
        indexKey="month"
        height={350}
        categories={[
          {
            key: "created",
            label: t("created"),
            color: "#f59e0b",
          },
          {
            key: "completed",
            label: t("completed"),
            color: "#10b981",
          },
        ]}
      />
    </div>
  );
}

export function BacklogEvolutionSkeleton() {
  return (
    <div className="col-span-4 h-[400px] rounded-xl bg-muted/50 animate-pulse" />
  );
}
