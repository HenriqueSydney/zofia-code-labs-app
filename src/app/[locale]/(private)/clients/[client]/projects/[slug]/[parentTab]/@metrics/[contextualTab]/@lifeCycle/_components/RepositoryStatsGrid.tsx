import { StatsCard } from "@/components/StatsCard";
import {
  FileCodeCorner,
  GitCommitHorizontal,
  GitPullRequest,
  UsersRound,
} from "lucide-react";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

export async function RepositoryStatsGrid({ slug }: { slug: string }) {
  // Chamada ao Use Case encapsulado para buscar as métricas do repositório
  const metrics = await getCachedGitHubMetrics(slug);

  // Cálculo para "Reviews Pendentes" (PRs que foram fechados mas não mesclados)
  const pendingReviews =
    metrics.activity.pullRequests.closedCount -
    metrics.activity.pullRequests.mergedCount;
  const totalCommits = metrics.activity.totalCommitsLast30Days;
  const contributorsCount = metrics.repoStats.totalContributors;

  // 2. Cálculo da Carga de Trabalho (Commits por pessoa)
  // Evita divisão por zero caso o repo não tenha contribuidores registrados
  const workload =
    contributorsCount > 0 ? (totalCommits / contributorsCount).toFixed(1) : "0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Branches Ativas (Usando total de commits como indicador de atividade) */}
      <StatsCard
        label="Branches Ativas"
        mainInformation={metrics.activity.totalCommitsLast30Days}
        Icon={GitCommitHorizontal}
        iconColor="bg-blue-500/10"
      />

      {/* Card 2: Reviews Pendentes (Calculado pela diferença de fechados/mesclados) */}
      <StatsCard
        label="Reviews Pendentes"
        mainInformation={pendingReviews}
        Icon={FileCodeCorner}
        iconColor="bg-accent/10"
      />

      {/* Card 3: Avg PR Time (Formatado com as informações de PRs) */}
      <StatsCard
        label="Avg PR Time"
        mainInformation={`${metrics.activity.pullRequests.avgMergeTimeHours}h`}
        Icon={GitPullRequest}
        iconColor="bg-destructive/10"
        description={`${metrics.activity.pullRequests.mergedCount} mesclados`}
      />

      <StatsCard
        label="Carga de Trabalho"
        mainInformation={workload}
        Icon={UsersRound}
        iconColor="bg-green-500/10"
        description="média de commits / autor"
      />
    </div>
  );
}
