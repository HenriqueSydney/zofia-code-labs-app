import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/Charts/BarChart";
import { getFinancialProjectionsAction } from "@/actions/stats/getFinancialProjectionsAction";

export async function FinancialProjections() {
  const { data } = await getFinancialProjectionsAction();

  if (!data) return null;

  // Dados mockados para o gráfico de barras, já que o use case retorna apenas sumário
  // Em uma implementação real, o use case deveria retornar o array historico+futuro
  const dummyChartData = [
    { name: "Atual", value: 100 }, // Placeholder visual
    { name: "Mês +1", value: 120 },
    { name: "Mês +2", value: 90 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-full">
        <BarChart
          title="Projeção de Receitas"
          description="Previsão para os próximos 3 meses"
          data={dummyChartData} // Ajustar quando tiver dados reais
          indexKey="name"
          categories={[
            { key: "value", label: "Receita", color: "hsl(var(--primary))" },
          ]}
          height={300}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Projeções (Próx. 3 meses)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita Prevista</span>
              <span className="font-medium">{data.revenue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Despesas Previstas</span>
              <span className="font-medium">{data.expenses}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">Lucro Projetado</span>
              <span
                className={`font-bold ${data.isProfitPositive ? "text-primary" : "text-destructive"}`}
              >
                {data.profit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Nota</h4>
            <p className="text-xs text-muted-foreground">
              Estes valores consideram faturas emitidas com vencimento futuro e
              despesas agendadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
