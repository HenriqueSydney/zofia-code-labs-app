import { StatsCard } from "@/components/StatsCard";
import {
  FileCodeCorner,
  GitCommitHorizontal,
  GitPullRequest,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

export async function RepositoryStatsGrid({ slug }: { slug: string }) {
  const t = await getTranslations("projects.metrics.lifecycle.repoStatsGrid");
  const metrics = await getCachedGitHubMetrics(slug);

  const pendingReviews =
    metrics.activity.pullRequests.closedCount -
    metrics.activity.pullRequests.mergedCount;
  const totalCommits = metrics.activity.totalCommitsLast30Days;
  const contributorsCount = metrics.repoStats.totalContributors;

  const workload =
    contributorsCount > 0 ? (totalCommits / contributorsCount).toFixed(1) : "0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        label={t("activeBranches")}
        mainInformation={metrics.activity.totalCommitsLast30Days}
        Icon={GitCommitHorizontal}
        iconColor="bg-blue-500/10"
      />

      <StatsCard
        label={t("pendingReviews")}
        mainInformation={pendingReviews}
        Icon={FileCodeCorner}
        iconColor="bg-accent/10"
      />

      <StatsCard
        label={t("avgPrTime")}
        mainInformation={`${metrics.activity.pullRequests.avgMergeTimeHours}h`}
        Icon={GitPullRequest}
        iconColor="bg-destructive/10"
        description={t("mergedCount", {
          count: metrics.activity.pullRequests.mergedCount,
        })}
      />

      <StatsCard
        label={t("workload")}
        mainInformation={workload}
        Icon={UsersRound}
        iconColor="bg-green-500/10"
        description={t("workloadDescription")}
      />
    </div>
  );
}
