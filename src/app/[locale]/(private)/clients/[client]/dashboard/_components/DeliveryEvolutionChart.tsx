import { LineChart, LineChartCategory } from "@/components/Charts/LineChart"; // Seu componente ajustado
import { getClientDeliveryEvolution } from "../_data/get-cached-delivery-evolution";

// Configuração das Linhas (Cores e Labels)
const chartCategories: LineChartCategory[] = [
  {
    key: "planned", // Deve bater com a chave do objeto do banco
    label: "Previsto",
    color: "hsl(var(--chart-2))", // Geralmente Laranja no tema Shadcn
    dashed: true, // UX: Linha tracejada indica estimativa/meta
  },
  {
    key: "completed", // Deve bater com a chave do objeto do banco
    label: "Entregue",
    color: "hsl(var(--chart-1))", // Geralmente Roxo/Azul no tema Shadcn
    dashed: false,
  },
];

export async function DeliveryEvolutionChart({ slug }: { slug: string }) {
  const data = await getClientDeliveryEvolution(slug);

  return (
    <LineChart
      title="Evolução das Entregas"
      description="O que foi planejado vs. o que de fato entregamos."
      data={data}
      indexKey="month" // Eixo X: Meses ("Jan", "Fev"...)
      categories={chartCategories}
      height={300}
    />
  );
}
