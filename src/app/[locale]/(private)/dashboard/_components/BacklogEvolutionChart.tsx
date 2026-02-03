import { getBacklogEvolutionChartAction } from "@/actions/stats/getBacklogEvolutionChartAction";
import { AreaLineChart } from "@/components/Charts/AreaLineChart"; // Seu componente

export async function BacklogEvolutionChart() {
  const { data } = await getBacklogEvolutionChartAction();

  if (!data) return null;

  return (
    <div className="col-span-4">
      <AreaLineChart
        title="Fluxo de Trabalho"
        description="Comparativo entre novas demandas e entregas realizadas nos últimos 6 meses."
        data={data}
        indexKey="month"
        height={350}
        categories={[
          {
            key: "created",
            label: "Novas Demandas",
            color: "#f59e0b", // Amber-500 (Demanda)
          },
          {
            key: "completed",
            label: "Entregas",
            color: "#10b981", // Emerald-500 (Output)
          },
        ]}
      />
    </div>
  );
}

// Skeleton Loading
export function BacklogEvolutionSkeleton() {
  return (
    <div className="col-span-4 h-[400px] rounded-xl bg-muted/50 animate-pulse" />
  );
}
