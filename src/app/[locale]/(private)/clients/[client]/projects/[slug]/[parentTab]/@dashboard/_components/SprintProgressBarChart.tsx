import { ChartCategory } from "@/components/Charts/AreaLineChart";
import { getCachedSprintMetrics } from "../_data/get-cached-sprint-metrics";
import { BarChart } from "@/components/Charts/BarChart";

interface ISprintProgressBarChart {
  slug: string;
}

export async function SprintProgressBarChart({
  slug,
}: ISprintProgressBarChart) {
  // Busca o histórico real de sprints processado pelo Use Case
  const metrics = await getCachedSprintMetrics(slug);

  // Definição das categorias para comparação visual
  const categories: ChartCategory[] = [
    {
      key: "planned",
      label: "Planejado",
      color: "hsl(var(--muted-foreground) / 0.5)",
    },
    {
      key: "completed",
      label: "Concluído",
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <BarChart
      title="Progresso por Sprint"
      description="Acompanhe o planejado vs concluído das sprints do projeto"
      // metrics.history contém o array { name, planned, completed }
      data={metrics.history}
      indexKey="name"
      categories={categories}
      height={250}
    />
  );
}
