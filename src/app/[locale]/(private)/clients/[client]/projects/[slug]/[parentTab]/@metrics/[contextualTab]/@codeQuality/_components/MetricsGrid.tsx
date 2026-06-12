import { StatsCard } from "@/components/StatsCard";
import { Bug, CheckCircle, Clock, Code, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCachedSonarMetrics } from "../_data/get-sonarqube-metrics";

export async function MetricsGrid({ slug }: { slug: string }) {
  const t = await getTranslations("projects.metrics.codeQuality.summary");
  const metrics = await getCachedSonarMetrics(slug);

  const formatDebt = (minutes: number) => {
    const hours = Math.round(minutes / 60);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        label={t("bugs")}
        mainInformation={metrics.bugs}
        trend={metrics.trends.bugs}
        Icon={Bug}
        iconColor="bg-destructive/10"
        reverseColor={true}
      />
      <StatsCard
        label={t("vulnerabilities")}
        mainInformation={metrics.vulnerabilities}
        trend={metrics.trends.vulnerabilities}
        Icon={Shield}
        iconColor="bg-orange-500/10"
        reverseColor={true}
      />
      <StatsCard
        label={t("codeSmells")}
        mainInformation={metrics.codeSmells}
        trend={metrics.trends.codeSmells}
        Icon={Code}
        iconColor="bg-orange-500/10"
        reverseColor={true}
      />
      <StatsCard
        label={t("coverage")}
        mainInformation={`${metrics.coverage}%`}
        trend={metrics.trends.coverage}
        Icon={CheckCircle}
        iconColor="bg-primary/10"
        reverseColor={false}
      />
      <StatsCard
        label={t("technicalDebt")}
        mainInformation={formatDebt(metrics.technicalDebt)}
        trend={metrics.trends.technicalDebt}
        Icon={Clock}
        iconColor="bg-primary/10"
        reverseColor={true}
      />
    </div>
  );
}
