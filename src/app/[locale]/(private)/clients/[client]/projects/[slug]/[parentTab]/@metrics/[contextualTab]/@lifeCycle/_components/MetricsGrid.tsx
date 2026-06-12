import { StatsCard } from "@/components/StatsCard";
import {
  FileCodeCorner,
  GitCommitHorizontal,
  GitPullRequest,
  UsersRound,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

export async function MetricsGrid({ slug }: { slug: string }) {
  const t = await getTranslations("projects.metrics.lifecycle");
  const metrics = await getCachedGitHubMetrics(slug);

  const openPrs =
    metrics.activity.pullRequests.mergedCount -
    metrics.activity.pullRequests.closedCount;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        label={t("totalCommits")}
        mainInformation={metrics.activity.totalCommitsLast30Days}
        Icon={GitCommitHorizontal}
        iconColor="bg-blue-500/10"
        description={t("last30Days")}
      />

      <StatsCard
        label={t("files")}
        mainInformation={metrics.repoStats.totalFiles}
        Icon={FileCodeCorner}
        iconColor="bg-accent/10"
        description={t("inRepository")}
      />

      <StatsCard
        label={t("pullRequests")}
        mainInformation={t("openPrs", { count: openPrs })}
        Icon={GitPullRequest}
        iconColor="bg-destructive/10"
        description={t("closedPrs", {
          count: metrics.activity.pullRequests.closedCount,
        })}
      />

      <StatsCard
        label={t("contributors")}
        mainInformation={metrics.repoStats.totalContributors}
        Icon={UsersRound}
        iconColor="bg-green-500/10"
      />

      <StatsCard
        label={t("cicdSuccess")}
        mainInformation={
          metrics.pipeline.successRate < 0
            ? "---"
            : `${metrics.pipeline.successRate}%`
        }
        Icon={Zap}
        iconColor="bg-orange-500/10"
        description={
          metrics.pipeline.successRate < 0
            ? t("noActionsRun")
            : t("successRate")
        }
      />
    </div>
  );
}
