import { DonutChart } from "@/components/Charts/DonutChart";
import { getClientProjectPipeline } from "../_data/get-cached-project-pipeline";

interface IProjectPipelineChart {
  slug: string;
}

// Mapa de cores baseado nas variáveis CSS do seu tema (Shadcn/UI)
const CHART_COLORS: Record<string, string> = {
  "Em Andamento": "hsl(var(--chart-1))", // Geralmente Azul/Roxo
  Concluído: "hsl(var(--chart-2))", // Geralmente Verde/Teal
  Negociação: "hsl(var(--chart-3))", // Geralmente Laranja
  Pausado: "hsl(var(--chart-4))", // Geralmente Rosa/Vermelho
  "Não Iniciado": "hsl(var(--chart-5))", // Geralmente Amarelo/Cinza
};

export async function ProjectPipelineChart({ slug }: IProjectPipelineChart) {
  // Busca os dados do banco (Cached)
  const rawData = await getClientProjectPipeline(slug);

  // Transforma os dados para o formato do Recharts ({ name, value })
  const chartData = rawData.map((item) => ({
    name: item.status, // Ex: "Em Andamento"
    value: item.count, // Ex: 5
  }));

  return (
    <DonutChart
      title="Pipeline de Projetos"
      description="Status atual da carteira"
      data={chartData}
      colors={CHART_COLORS}
      height={350} // Ajuste a altura conforme necessário
    />
  );
}
