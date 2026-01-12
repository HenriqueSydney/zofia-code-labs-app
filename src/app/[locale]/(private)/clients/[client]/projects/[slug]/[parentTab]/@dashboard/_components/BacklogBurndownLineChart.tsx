import { LineChart, LineChartCategory } from "@/components/Charts/LineChart";
import { getCachedSprintMetrics } from "../_data/get-cached-sprint-metrics";

interface IBacklogBurndownLineChart {
  slug: string;
}

export async function BacklogBurndownLineChart({
  slug,
}: IBacklogBurndownLineChart) {
  const metrics = await getCachedSprintMetrics(slug);

  const categories: LineChartCategory[] = [
    {
      key: "ideal",
      label: "Ideal",
      color: "hsl(var(--muted-foreground))",
      dashed: true,
    },
    {
      key: "real",
      label: "Real",
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <LineChart
      title="Burndown Chart - Sprint Atual"
      description="Progresso diário vs linha ideal de queima baseada na sprint ativa"
      // metrics.burndown contém o array { day, ideal, real } gerado dinamicamente
      data={metrics.burndown}
      indexKey="day"
      categories={categories}
    />
  );
}
