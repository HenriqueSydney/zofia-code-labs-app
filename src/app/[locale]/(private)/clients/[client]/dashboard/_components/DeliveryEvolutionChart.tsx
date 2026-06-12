import { LineChart, LineChartCategory } from "@/components/Charts/LineChart";
import { getClientDeliveryEvolution } from "../_data/get-cached-delivery-evolution";
import { getTranslations } from "next-intl/server";

export async function DeliveryEvolutionChart({ slug }: { slug: string }) {
  const t = await getTranslations("clients.dashboard.charts");
  const data = await getClientDeliveryEvolution(slug);

  const chartCategories: LineChartCategory[] = [
    {
      key: "planned",
      label: t("planned"),
      color: "hsl(var(--chart-2))",
      dashed: true,
    },
    {
      key: "completed",
      label: t("completed"),
      color: "hsl(var(--chart-1))",
      dashed: false,
    },
  ];

  return (
    <LineChart
      title={t("deliveryEvolution")}
      description={t("deliveryEvolutionDescription")}
      data={data}
      indexKey="month"
      categories={chartCategories}
      height={300}
    />
  );
}
