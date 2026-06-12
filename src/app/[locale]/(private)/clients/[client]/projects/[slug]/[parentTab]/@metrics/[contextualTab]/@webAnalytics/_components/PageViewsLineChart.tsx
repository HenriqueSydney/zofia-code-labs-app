"use client";

import {
  AreaLineChart,
  ChartCategory,
} from "@/components/Charts/AreaLineChart";
import { date } from "@/lib/dayjs";
import { UmamiHistoryResponse } from "@/services/webAnalytics/IWebAnalyticsService";
import { useTranslations } from "next-intl";

interface IPageViewsLineChart {
  history: UmamiHistoryResponse;
}

export function PageViewsLineChart({ history }: IPageViewsLineChart) {
  const t = useTranslations("projects.metrics.webAnalytics.charts.pageViews");

  const visitorsTrendData = history.pageviews.map((pv, index) => {
    const session = history.sessions[index];
    return {
      displayDate: date(pv.x).format("DD/MMM"),
      visitors: session?.y || 0,
      pageViews: pv.y,
    };
  });

  const categories: ChartCategory[] = [
    {
      key: "pageViews",
      label: t("views"),
      color: "#3b82f6",
    },
    {
      key: "visitors",
      label: t("visitors"),
      color: "#6366f1",
    },
  ];

  return (
    <AreaLineChart
      title={t("title")}
      description={t("description")}
      data={visitorsTrendData}
      indexKey="displayDate"
      categories={categories}
    />
  );
}
