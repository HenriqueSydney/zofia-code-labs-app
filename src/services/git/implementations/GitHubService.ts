import { IntegrationBase } from "@/services/IntegrationBase";
import {
  GitActivity,
  IGitService,
  PRAnalysis,
  RepoStats,
  WorkflowRun,
  CommitStat,
  PRDetail,
  CommitData,
} from "../IGitService";
import { MinimalRepositoryListDTO } from "@/dto/github/RepositoriesDTO";
import {
  IProjectLinkable,
  SetupProjectParams,
  SetupProjectResult,
} from "@/services/IProjectLinkable";
import { GitHubSetupSchema } from "@/schemas/integration/GitHubSetupSchema";
import { date } from "@/lib/dayjs";

export class GitHubService
  extends IntegrationBase
  implements IGitService, IProjectLinkable
{
  private readonly baseUrl = "https://api.github.com";
  private readonly personalToken: string;
  private readonly orgName?: string; // Nome da Organização configurado globalmente
  private readonly owner?: string; // Extraído do full_name no contexto do projeto
  private readonly repo?: string; // Extraído do full_name no contexto do projeto

  constructor(config: {
    personalToken: string;
    orgName?: string;
    owner?: string;
    repo?: string;
  }) {
    super("github");
    this.personalToken = config.personalToken;
    this.orgName = config.orgName;
    this.owner = config.owner;
    this.repo = config.repo;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}) {
    return {
      Authorization: `Bearer ${this.personalToken}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...extraHeaders,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers: this.getHeaders(options.headers as Record<string, string>),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(
        `GitHub API Error: ${res.status} - ${
          errorBody.message || res.statusText
        }`
      );
    }

    return res.json() as Promise<T>;
  }

  private ensureContext() {
    if (!this.owner || !this.repo) {
      throw new Error(
        "GitHubService: Operação requer contexto de repositório (owner/repo)."
      );
    }
  }

  /**
   * Métodos Globais e de Gerenciamento
   */

  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      await this.request("/user", { signal: AbortSignal.timeout(5000) });
      return { status: "up", latency: Math.round(performance.now() - start) };
    } catch {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  async listRepositories(): Promise<MinimalRepositoryListDTO[]> {
    // Retorna repositórios do usuário e de organizações onde é membro
    return this.request<MinimalRepositoryListDTO[]>(
      `/user/repos?affiliation=owner,organization_member&sort=updated`
    );
  }

  async createRepository(name: string, isPrivate: boolean) {
    // Se houver orgName, cria na Org, senão no perfil pessoal
    const endpoint = this.orgName
      ? `/orgs/${this.orgName}/repos`
      : `/user/repos`;
    const data = await this.request<any>(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, private: isPrivate }),
    });

    return data;
  }

  async createFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newName: string
  ) {
    // O template pode ser de qualquer owner, mas o destino respeita a orgName
    return this.request<any>(
      `/repos/${templateOwner}/${templateRepo}/generate`,
      {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          owner: this.orgName || undefined, // undefined faz o GitHub assumir o usuário do Token
          private: true,
        }),
      }
    );
  }

  /**
   * Métricas e Inspeção (Agnóstico: Funciona para Usuário ou Org)
   */

  async getRepoStats(): Promise<RepoStats> {
    this.ensureContext();
    const d = await this.request<any>(`/repos/${this.owner}/${this.repo}`);
    return {
      stars: d.stargazers_count,
      forks: d.forks_count,
      openIssues: d.open_issues_count,
      watchers: d.watchers_count,
      size: d.size,
    };
  }

  async getLatestWorkflowRuns(limit = 5): Promise<WorkflowRun[]> {
    this.ensureContext();
    const data = await this.request<any>(
      `/repos/${this.owner}/${this.repo}/actions/runs?per_page=${limit}`
    );
    if (!data.workflow_runs) return [];

    return data.workflow_runs.map((run: any) => ({
      id: run.id,
      name: run.name,
      status: run.conclusion || run.status,
      duration:
        run.updated_at && run.created_at
          ? (new Date(run.updated_at).getTime() -
              new Date(run.created_at).getTime()) /
            1000
          : 0,
      author: run.head_commit?.author?.name || "Unknown",
      createdAt: run.created_at,
    }));
  }

  async getCommitStats(): Promise<CommitData> {
    this.ensureContext();
    const thirtyDaysAgo = date().subtract(30, "days").toISOString();

    const commits = await this.request<any[]>(
      `/repos/${this.owner}/${this.repo}/commits?since=${thirtyDaysAgo}`
    );

    const stats = commits.reduce((acc: Record<string, number>, curr: any) => {
      const dateKey = date(curr.commit.author.date).format("YYYY-MM-DD");
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return {
      commitsRaw: commits,
      stats: Object.entries(stats).map(([date, count]) => ({ date, count })),
    };
  }

  async getLanguages(): Promise<Record<string, number>> {
    this.ensureContext();
    return this.request<Record<string, number>>(
      `/repos/${this.owner}/${this.repo}/languages`
    );
  }

  async getContent(path: string): Promise<string> {
    this.ensureContext();
    const data = await this.request<any>(
      `/repos/${this.owner}/${this.repo}/contents/${path}`
    );
    if (!data.content) throw new Error("Content not found");
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  async getPullRequestAnalysis(): Promise<PRAnalysis> {
    this.ensureContext();

    // Buscamos os últimos 30 PRs com estado 'closed'
    // Isso retorna tanto os que foram Merged quanto os apenas Closed
    const prs = await this.request<any[]>(
      `/repos/${this.owner}/${this.repo}/pulls?state=closed&per_page=30`
    );

    // 1. Contagem total de fechados (ignorando bots se desejar manter consistência)
    const closedPrs = prs.filter((pr) => !pr.state.closed);
    const closedCount = closedPrs.length;

    // 2. Filtramos apenas os que foram mesclados (entrega real)
    const mergedPrs = closedPrs.filter((pr) => pr.merged_at);
    const mergedCount = mergedPrs.length;

    if (mergedCount === 0) {
      return {
        avgMergeTimeHours: 0,
        mergedCount: 0,
        closedCount,
        latestMergedPRs: [],
      };
    }

    // 3. Cálculo do tempo médio de merge (apenas para os mesclados)
    const totalTime = mergedPrs.reduce((acc: number, pr: any) => {
      return (
        acc +
        (new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime())
      );
    }, 0);

    // 4. Mapeamento para listagem de UI (Histórico de Sucesso)
    const latestMergedPRs: PRDetail[] = mergedPrs.slice(0, 10).map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      mergedAt: pr.merged_at,
      url: pr.html_url,
    }));

    return {
      avgMergeTimeHours: totalTime / mergedCount / (1000 * 60 * 60),
      mergedCount,
      closedCount,
      latestMergedPRs,
    };
  }

  async findPackageFiles() {
    this.ensureContext();
    const query = `repo:${this.owner}/${this.repo} filename:package.json filename:requirements.txt filename:go.mod filename:composer.json`;
    const data = await this.request<any>(
      `/search/code?q=${encodeURIComponent(query)}`
    );
    return (data.items || []).map((item: any) => ({
      name: item.name,
      path: item.path,
      downloadUrl: item.html_url,
    }));
  }

  async getTopContributors() {
    this.ensureContext();
    const data = await this.request<any[]>(
      `/repos/${this.owner}/${this.repo}/contributors?per_page=5`
    );
    return data.map((c: any) => ({
      login: c.login,
      contributions: c.contributions,
    }));
  }

  async listBranchesSecurity() {
    this.ensureContext();
    const branches = await this.request<any[]>(
      `/repos/${this.owner}/${this.repo}/branches`
    );
    return branches
      .filter((b: any) => b.protected)
      .map((b: any) => ({
        name: b.name,
        protectionUrl: b.protection_url,
      }));
  }

  async getRecentActivity(limit = 10): Promise<GitActivity[]> {
    this.ensureContext();
    const events = await this.request<any[]>(
      `/repos/${this.owner}/${this.repo}/events?per_page=${limit}`
    );
    return events.map((e: any) => ({
      id: e.id,
      type:
        e.type === "PushEvent"
          ? "push"
          : e.type === "PullRequestEvent"
          ? "pull_request"
          : "other",
      author: e.actor.login,
      message: e.payload.commits?.[0]?.message || `Activity: ${e.type}`,
      date: e.created_at,
      url: `https://github.com/${this.owner}/${this.repo}/commit/${
        e.payload.head || ""
      }`,
    }));
  }

  /**
   * Implementação IProjectLinkable
   */

  async setupProject<T>(
    params: SetupProjectParams<T>
  ): Promise<SetupProjectResult> {
    const validatedData = GitHubSetupSchema.parse(params.data);
    let externalId: string = "";
    let metadata: Record<string, any> = {};

    if (validatedData.isNewRepo) {
      const repoName = validatedData.repoName || params.projectSlug;

      if (validatedData.shouldClone && validatedData.templateRepoId) {
        const [tOwner, tRepo] = validatedData.templateRepoId.split("/");
        const repo = await this.createFromTemplate(tOwner, tRepo, repoName);
        externalId = String(repo.id);
        metadata = {
          name: repo.name,
          full_name: repo.full_name,
          owner_type: repo.owner.type,
        };
      } else {
        const repo = await this.createRepository(repoName, true);
        externalId = String(repo.id);
        // O GitHub retorna o objeto owner completo, usamos o tipo (User/Organization)
        metadata = {
          name: repoName,
          full_name: repo.full_name,
          owner_type: repo.owner.type,
        };
      }
    } else if (validatedData.repositoryId) {
      const repo = await this.request<any>(
        `/repositories/${validatedData.repositoryId}`
      );
      externalId = String(repo.id);
      metadata = {
        name: repo.name,
        full_name: repo.full_name,
        owner_type: repo.owner.type,
      };
    }

    return {
      externalId,
      metadata: { ...metadata, provider: "github", setupAt: date().toDate() },
    };
  }
}
