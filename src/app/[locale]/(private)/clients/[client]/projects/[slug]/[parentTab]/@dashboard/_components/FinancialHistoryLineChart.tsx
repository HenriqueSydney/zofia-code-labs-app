import { LineChart, LineChartCategory } from "@/components/Charts/LineChart";
import { getCachedFinancialMetrics } from "../_data/get-cached-financial-metrics";

interface IFinancialHistoryChart {
  slug: string;
}

export async function FinancialHistoryChart({ slug }: IFinancialHistoryChart) {
  // Busca as métricas financeiras reais processadas pelo Use Case
  const metrics = await getCachedFinancialMetrics(slug);

  // Mantemos as cores semânticas (Verde para Receitas, Vermelho para Despesas)
  const categories: LineChartCategory[] = [
    {
      key: "revenue",
      label: "Receitas",
      color: "#10b981", // Emerald-500
    },
    {
      key: "expenses",
      label: "Despesas",
      color: "#ef4444", // Red-500
    },
  ];

  return (
    <LineChart
      title="Fluxo Financeiro"
      description="Comparativo da evolução das Despesas e Receitas"
      // metrics.chartData contém o array { month, revenue, expenses } agrupado pelo Repository
      data={metrics.chartData}
      indexKey="month"
      categories={categories}
      height={300}
    />
  );
}
