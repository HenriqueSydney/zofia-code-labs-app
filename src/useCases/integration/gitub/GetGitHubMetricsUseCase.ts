import { AppError } from "@/errors/AppError";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import {
  CommitData,
  CommitStat,
  IGitService,
  PRDetail,
} from "@/services/git/IGitService";
import {
  IntegrationType,
  IntegrationFactory,
} from "@/services/IntegrationFactory";

export interface GitHubMetrics {
  repoStats: {
    stars: number;
    forks: number;
    openIssues: number;
    size: number;
    totalFiles: number; // Para o card "Arquivos"
    totalContributors: number; // Para o card "Contribuidores"
    contributors: {
      login: string;
      contributions: number;
    }[];
  };
  activity: {
    totalCommitsLast30Days: number;
    commits: CommitData;
    pullRequests: {
      avgMergeTimeHours: number;
      successRate: number;
      mergedCount: number; // Renomeado para clareza
      closedCount: number;
      history: PRDetail[];
    };
  };
  pipeline: {
    latestRuns: any[];
    successRate: number;
  };
  languages: Record<string, number>;
}

interface MetricsResponse {
  metrics: GitHubMetrics;
}

interface GetMetricsRequest {
  userId: string;
  projectSlug: string;
}
export class GetGitHubMetricsUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private integrationFactory: IntegrationFactory
  ) {}

  async execute({
    userId,
    projectSlug,
  }: GetMetricsRequest): Promise<MetricsResponse> {
    const projectLink =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.GITHUB
      );

    if (!projectLink || !projectLink.organizationIntegration) {
      throw new AppError("Integração não configurada.", 404);
    }

    const projectConfig = projectLink.config as any;
    const [owner, repo] = projectConfig.full_name.split("/");

    const githubService =
      await this.integrationFactory.getIntegration<IGitService>({
        organizationId: projectLink.organizationIntegration.organizationId,
        type: IntegrationType.GITHUB,
        contextOptions: { owner, repo },
      });

    // Execução paralela para mitigar latência
    const [stats, workflowRuns, commitStats, prAnalysis, contributors] =
      await Promise.all([
        githubService.getRepoStats(),
        githubService.getLatestWorkflowRuns(10),
        githubService.getCommitStats(),
        githubService.getPullRequestAnalysis(),
        githubService.getTopContributors(),
      ]);

    // Mapeamento direto para os cards da imagem_3de529.png
    return {
      metrics: {
        repoStats: {
          ...stats,
          totalFiles: stats.size, // Usando o tamanho/arquivos do repo stats
          totalContributors: contributors.filter(
            (contributor) => !contributor.login.includes("[bot]")
          ).length, // Card: Contribuidores
          contributors: contributors,
        },
        activity: {
          totalCommitsLast30Days: commitStats.stats.reduce(
            (acc, curr) => acc + curr.count,
            0
          ),
          commits: commitStats,
          pullRequests: {
            mergedCount: prAnalysis.mergedCount,
            closedCount: prAnalysis.closedCount,
            successRate: Math.round(
              (prAnalysis.mergedCount / prAnalysis.closedCount) * 100
            ), // Ex: 80% de PRs aceitos
            avgMergeTimeHours: Math.round(prAnalysis.avgMergeTimeHours),
            history: prAnalysis.latestMergedPRs,
          },
        },
        pipeline: {
          latestRuns: workflowRuns,
          successRate: this.calculateSuccessRate(workflowRuns), // Card: Taxa de Sucesso CI/CD
        },
        languages: {}, // Pode ser buscado se necessário
      },
    };
  }

  private calculateSuccessRate(runs: any[]): number {
    if (runs.length === 0) return -1;
    const successful = runs.filter((run) => run.status === "success").length;
    return Math.round((successful / runs.length) * 100);
  }
}
