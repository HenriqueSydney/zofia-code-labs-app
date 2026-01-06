import { IntegrationBase } from "@/services/IntegrationBase";
import {
  GitActivity,
  IGitService,
  PRAnalysis,
  RepoStats,
  WorkflowRun,
} from "../IGitService";

export class GitHubService extends IntegrationBase implements IGitService {
  private readonly baseUrl = "https://api.github.com";
  private readonly personalToken: string;
  private readonly orgName: string;

  constructor(config: { personalToken: string; orgName: string }) {
    super("github"); // Chamada ao super sem argumentos, assumindo que IntegrationBase não os exige mais
    this.personalToken = config.personalToken;
    this.orgName = config.orgName;
  }

  /**
   * Helper para centralizar os Headers de autenticação
   */
  private getHeaders(extraHeaders: Record<string, string> = {}) {
    return {
      Authorization: `Bearer ${this.personalToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...extraHeaders,
    };
  }

  /**
   * Implementação do HealthCheck com cálculo de latência
   */
  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // O endpoint /user é ótimo para validar se o token é válido
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      return {
        status: response.ok ? "up" : "down",
        latency: Math.round(performance.now() - start),
      };
    } catch (error) {
      return {
        status: "down",
        latency: Math.round(performance.now() - start),
      };
    }
  }

  async createRepository(name: string, isPrivate: boolean) {
    const endpoint = this.orgName
      ? `/orgs/${this.orgName}/repos`
      : `/user/repos`;

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, private: isPrivate }),
    });

    if (!res.ok) throw new Error(`GitHub Error: ${res.statusText}`);

    const data = await res.json();
    return { url: data.html_url, id: data.id };
  }

  async createFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newName: string
  ) {
    const res = await fetch(
      `${this.baseUrl}/repos/${templateOwner}/${templateRepo}/generate`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: newName,
          owner: this.orgName || undefined, // Garante criação na org se definida
          private: true,
        }),
      }
    );
    return res.json();
  }

  async getRepoStats(owner: string, repo: string): Promise<RepoStats> {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers: this.getHeaders(),
    });
    const d = await res.json();
    return {
      stars: d.stargazers_count,
      forks: d.forks_count,
      openIssues: d.open_issues_count,
      watchers: d.watchers_count,
      size: d.size,
    };
  }

  async getLatestWorkflowRuns(
    owner: string,
    repo: string,
    limit = 5
  ): Promise<WorkflowRun[]> {
    const res = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/actions/runs?per_page=${limit}`,
      { headers: this.getHeaders() }
    );
    const data = await res.json();

    if (!data.workflow_runs) return [];

    return data.workflow_runs.map((run: any) => ({
      id: run.id,
      name: run.name,
      status: run.conclusion || run.status,
      duration:
        (new Date(run.updated_at).getTime() -
          new Date(run.created_at).getTime()) /
        1000,
      author: run.head_commit?.author?.name || "Unknown",
      createdAt: run.created_at,
    }));
  }

  async getRecentActivity(
    owner: string,
    repo: string,
    limit = 10
  ): Promise<GitActivity[]> {
    const res = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/events?per_page=${limit}`,
      { headers: this.getHeaders() }
    );
    const events = await res.json();

    if (!Array.isArray(events)) return [];

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
      url: `https://github.com/${owner}/${repo}/commit/${e.payload.head || ""}`,
    }));
  }

  async getLanguages(
    owner: string,
    repo: string
  ): Promise<Record<string, number>> {
    const res = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/languages`,
      { headers: this.getHeaders() }
    );
    return await res.json();
  }

  async getContent(owner: string, repo: string, path: string): Promise<string> {
    const res = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
      { headers: this.getHeaders() }
    );
    const data = await res.json();
    if (!data.content) throw new Error("Content not found");
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  async getPullRequestAnalysis(
    owner: string,
    repo: string
  ): Promise<PRAnalysis> {
    const res = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/pulls?state=closed&per_page=30`,
      { headers: this.getHeaders() }
    );
    const prs = await res.json();

    if (!Array.isArray(prs)) return { avgMergeTimeHours: 0, count: 0 };

    const mergedPrs = prs.filter((pr: any) => pr.merged_at);
    if (mergedPrs.length === 0) return { avgMergeTimeHours: 0, count: 0 };

    const totalTime = mergedPrs.reduce((acc: number, pr: any) => {
      const created = new Date(pr.created_at).getTime();
      const merged = new Date(pr.merged_at).getTime();
      return acc + (merged - created);
    }, 0);

    return {
      avgMergeTimeHours: totalTime / mergedPrs.length / (1000 * 60 * 60),
      count: mergedPrs.length,
    };
  }

  /**
   * Busca arquivos de dependências para identificar a stack do projeto
   */
  async findPackageFiles(owner: string, repo: string) {
    // Busca arquivos importantes usando a API de Search do GitHub
    const query = `repo:${owner}/${repo} filename:package.json filename:requirements.txt filename:go.mod filename:composer.json`;
    const res = await fetch(
      `${this.baseUrl}/search/code?q=${encodeURIComponent(query)}`,
      { headers: this.getHeaders() }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      name: item.name,
      path: item.path,
      downloadUrl: item.html_url,
    }));
  }

  /**
   * Retorna os principais contribuidores do repositório
   */
  async getTopContributors(owner: string, repo: string) {
    const res = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contributors?per_page=5`,
      { headers: this.getHeaders() }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((c: any) => ({
      login: c.login,
      contributions: c.contributions,
    }));
  }

  /**
   * Lista branches que possuem regras de proteção (Segurança)
   */
  async listBranchesSecurity(owner: string, repo: string) {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) return [];

    const branches = await res.json();
    // Filtra apenas branches protegidas (onde b.protected === true)
    return branches
      .filter((b: any) => b.protected)
      .map((b: any) => ({
        name: b.name,
        protectionUrl: b.protection_url,
      }));
  }
}
