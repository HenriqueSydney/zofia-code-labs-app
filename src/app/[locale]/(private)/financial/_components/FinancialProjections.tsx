import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/Charts/BarChart";
import { getFinancialProjectionsAction } from "@/actions/stats/getFinancialProjectionsAction";
import { getTranslations } from "next-intl/server";

export async function FinancialProjections() {
  const t = await getTranslations("financial.projections");
  const { data } = await getFinancialProjectionsAction();

  if (!data) return null;

  const dummyChartData = [
    { name: "Atual", value: 100 },
    { name: t("monthPlus1"), value: 120 },
    { name: t("monthPlus2"), value: 90 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-full">
        <BarChart
          title={t("title")}
          description={t("description")}
          data={dummyChartData}
          indexKey="name"
          categories={[
            {
              key: "value",
              label: t("revenueLabel"),
              color: "hsl(var(--primary))",
            },
          ]}
          height={300}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("summaryTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("expectedRevenue")}</span>
              <span className="font-medium">{data.revenue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("expectedExpenses")}</span>
              <span className="font-medium">{data.expenses}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">{t("projectedProfit")}</span>
              <span
                className={`font-bold ${data.isProfitPositive ? "text-primary" : "text-destructive"}`}
              >
                {data.profit}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t("noteTitle")}</h4>
            <p className="text-xs text-muted-foreground">{t("noteDescription")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
