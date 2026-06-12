import { LineChart, LineChartCategory } from "@/components/Charts/LineChart";
import { getTranslations } from "next-intl/server";
import { getCachedFinancialMetrics } from "../_data/get-cached-financial-metrics";

interface IFinancialHistoryChart {
  slug: string;
}

export async function FinancialHistoryChart({ slug }: IFinancialHistoryChart) {
  const t = await getTranslations("projects.dashboard.charts.financial");
  const metrics = await getCachedFinancialMetrics(slug);

  const categories: LineChartCategory[] = [
    {
      key: "revenue",
      label: t("revenue"),
      color: "#10b981",
    },
    {
      key: "expenses",
      label: t("expenses"),
      color: "#ef4444",
    },
  ];

  return (
    <LineChart
      title={t("title")}
      description={t("description")}
      data={metrics.chartData}
      indexKey="month"
      categories={categories}
      height={300}
    />
  );
}
