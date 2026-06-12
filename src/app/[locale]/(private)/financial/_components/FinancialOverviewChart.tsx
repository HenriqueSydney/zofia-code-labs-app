import { getFinancialOverviewAction } from "@/actions/stats/getFinancialOverviewAction";
import { AreaLineChart } from "@/components/Charts/AreaLineChart";

export async function FinancialOverviewChart() {
  const { data } = await getFinancialOverviewAction();

  if (!data) return null;

  return (
    <div className="lg:col-span-2 h-full! !max-h-[800px]">
      <AreaLineChart
        title="Fluxo de Caixa"
        description="Comparativo de Receitas e Despesas (Regime de Caixa)"
        data={data.chartData}
        indexKey="month"
        height={300}
        categories={[
          { key: "revenue", label: "Receitas", color: "#10b981" }, // Verde
          { key: "expenses", label: "Despesas", color: "#ef4444" }, // Vermelho
        ]}
      />
    </div>
  );
}
