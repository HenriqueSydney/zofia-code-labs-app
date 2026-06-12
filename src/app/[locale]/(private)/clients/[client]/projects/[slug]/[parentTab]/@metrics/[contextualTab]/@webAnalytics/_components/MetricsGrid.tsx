import { StatsCard } from "@/components/StatsCard";
import { Eye, Files, MousePointerClick, Timer, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCachedUmamiMetrics } from "../_data/get-umami-metrics";
import { formatDuration } from "@/utils/formatDuration";

export async function MetricsGrid({ slug }: { slug: string }) {
  const t = await getTranslations("projects.metrics.webAnalytics");
  const metrics = await getCachedUmamiMetrics(slug);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        label={t("pageViews")}
        mainInformation={metrics.pageviews}
        trend={metrics.trends.pageviews}
        Icon={Eye}
        iconColor="bg-blue-500/10"
        reverseColor={false}
      />

      <StatsCard
        label={t("uniqueVisitors")}
        mainInformation={metrics.visitors}
        trend={metrics.trends.visitors}
        Icon={Users}
        iconColor="bg-primary/10"
        reverseColor={false}
      />

      <StatsCard
        label={t("bounceRate")}
        mainInformation={`${metrics.bounceRate}%`}
        trend={metrics.trends.bounceRate}
        Icon={MousePointerClick}
        iconColor="bg-destructive/10"
        reverseColor={true}
      />

      <StatsCard
        label={t("avgDuration")}
        mainInformation={formatDuration(metrics.avgDuration)}
        trend={metrics.trends.avgDuration}
        Icon={Timer}
        iconColor="bg-green-500/10"
        reverseColor={false}
      />

      <StatsCard
        label={t("pagesPerSession")}
        mainInformation={metrics.pagesPerSession}
        trend={metrics.trends.pagesPerSession}
        Icon={Files}
        iconColor="bg-orange-500/10"
        reverseColor={false}
      />
    </div>
  );
}
