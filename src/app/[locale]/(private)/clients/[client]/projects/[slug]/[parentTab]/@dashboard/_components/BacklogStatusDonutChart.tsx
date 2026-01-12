import { DonutChart } from "@/components/Charts/DonutChart";
import { backlogStatusMapper } from "@/mappers/BacklogMappers";
import { getCachedBacklogMetrics } from "../_data/get-cached-backlog-metrics";

// Mantemos o mapeamento de cores consistente com seus Badges
const BACKLOG_STATUS_COLORS: Record<string, string> = {
  [backlogStatusMapper.TODO]: "hsl(var(--muted-foreground))",
  [backlogStatusMapper.IN_PROGRESS]: "hsl(var(--accent))",
  [backlogStatusMapper.REVIEW]: "hsl(var(--primary))",
  [backlogStatusMapper.DONE]: "#16a34a",
  [backlogStatusMapper.CANCELED]: "#dc2626",
};

export async function BacklogStatusDonutChart({ slug }: { slug: string }) {
  // Busca as métricas reais do Backlog
  const metrics = await getCachedBacklogMetrics(slug);

  return (
    <DonutChart
      title="Status das Tarefas"
      description="Distribuição real das tarefas entre status no projeto"
      // metrics.chartData já vem formatado pelo UseCase { name: string, value: number }
      data={metrics.chartData}
      colors={BACKLOG_STATUS_COLORS}
      height={300}
    />
  );
}
