import {
  AreaLineChart,
  ChartCategory,
} from "@/components/Charts/AreaLineChart";
import { date } from "@/lib/dayjs";
import { UmamiHistoryResponse } from "@/services/webAnalytics/IWebAnalyticsService";

interface IPageViewsLineChart {
  history: UmamiHistoryResponse;
}

export function PageViewsLineChart({ history }: IPageViewsLineChart) {
  // 1. Mapeamento dos dados do Umami para o formato do gráfico
  const visitorsTrendData = history.pageviews.map((pv, index) => {
    const session = history.sessions[index];
    return {
      // indexKey que será usado no gráfico
      displayDate: date(pv.x).format("DD/MMM"),
      visitors: session?.y || 0,
      pageViews: pv.y,
    };
  });

  // 2. Definição das categorias para renderizar as duas áreas (Page Views e Visitantes)
  const categories: ChartCategory[] = [
    {
      key: "pageViews",
      label: "Visualizações",
      color: "#3b82f6", // Azul (equivalente ao blue-500)
    },
    {
      key: "visitors",
      label: "Visitantes",
      color: "#6366f1", // Indigo (equivalente ao indigo-500)
    },
  ];

  return (
    <AreaLineChart
      title="Visitantes e Page Views"
      description="Tendência dos últimos 14 dias"
      data={visitorsTrendData}
      indexKey="displayDate"
      categories={categories}
    />
  );
}
