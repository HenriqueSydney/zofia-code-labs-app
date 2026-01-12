import { StatsCard } from "@/components/StatsCard";
import {
  FileCodeCorner,
  GitCommitHorizontal,
  GitPullRequest,
  UsersRound,
  Zap,
} from "lucide-react";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

export async function MetricsGrid({ slug }: { slug: string }) {
  // Chamada ao Use Case encapsulado para buscar as métricas do repositório
  const metrics = await getCachedGitHubMetrics(slug);

  const openPrs =
    metrics.activity.pullRequests.mergedCount -
    metrics.activity.pullRequests.closedCount;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Card 1: Commits Totais */}
      <StatsCard
        label="Commits Totais"
        mainInformation={metrics.activity.totalCommitsLast30Days}
        Icon={GitCommitHorizontal}
        iconColor="bg-blue-500/10"
        description="últimos 30 dias"
      />

      {/* Card 2: Arquivos */}
      <StatsCard
        label="Arquivos"
        mainInformation={metrics.repoStats.totalFiles}
        Icon={FileCodeCorner}
        iconColor="bg-accent/10"
        description="no repositório"
      />

      {/* Card 3: Pull Requests */}
      <StatsCard
        label="Pull Requests"
        mainInformation={`${openPrs} abertas`}
        Icon={GitPullRequest}
        iconColor="bg-destructive/10"
        description={`${metrics.activity.pullRequests.closedCount} fechadas`}
      />

      {/* Card 4: Contribuidores */}
      <StatsCard
        label="Contribuidores"
        mainInformation={metrics.repoStats.totalContributors}
        Icon={UsersRound}
        iconColor="bg-green-500/10"
      />

      {/* Card 5: Taxa de Sucesso CI/CD */}
      <StatsCard
        label="Sucesso CI/CD"
        mainInformation={
          metrics.pipeline.successRate < 0
            ? "---"
            : `${metrics.pipeline.successRate}%`
        }
        Icon={Zap}
        iconColor="bg-orange-500/10"
        description={
          metrics.pipeline.successRate < 0
            ? "nenhuma action executada"
            : "taxa de sucesso"
        }
      />
    </div>
  );
}
