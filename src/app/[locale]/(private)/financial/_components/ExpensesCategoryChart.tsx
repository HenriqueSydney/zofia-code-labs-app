import { getExpensesByCategoryAction } from "@/actions/stats/getExpensesByCategoryAction";
import { PieCustomChart } from "@/components/Charts/PieCustomChart";

export async function ExpensesCategoryChart() {
  const { data } = await getExpensesByCategoryAction();

  if (!data) return null;

  // Adaptando os dados para o formato que o PieCustomChart espera
  // Ele espera 'iconKey', vamos adicionar um genérico ou mapear se tivermos categorias fixas
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color || "#8884d8",
    iconKey: "desktop", // Placeholder, pois o PieChart pede ícone. Idealmente remover obrigatoriedade do ícone no componente ou mapear.
  }));

  return (
    <div className="lg:col-span-1">
      <PieCustomChart
        title="Despesas por Categoria"
        description="Distribuição dos gastos pagos"
        data={chartData}
      />
    </div>
  );
}
