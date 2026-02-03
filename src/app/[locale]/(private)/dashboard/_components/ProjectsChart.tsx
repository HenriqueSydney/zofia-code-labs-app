import { getProjectsVolumeChartAction } from "@/actions/stats/getProjectsVolumeChartAction";
import { BarChart } from "@/components/Charts/BarChart"; // Seu componente existente

export async function ProjectsChart() {
  const { data: chartData } = await getProjectsVolumeChartAction();

  if (!chartData) return null;

  return (
    <div className="col-span-4">
      <BarChart
        title="Volume de Projetos"
        description="Novos projetos criados nos últimos 6 meses"
        data={chartData}
        indexKey="month"
        categories={[
          { key: "projects", label: "Projetos Criados", color: "#2563eb" }, // Ajuste a cor conforme seu tema (ex: hsl(var(--primary)))
        ]}
        height={350}
      />
    </div>
  );
}
