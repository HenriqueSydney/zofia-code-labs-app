import { IntegrationBase } from "@/services/IntegrationBase";
import { GitActivity, IGitService, PRAnalysis } from "../IGitService";

export class GitLabService extends IntegrationBase implements IGitService {
  private readonly baseUrl = "https://gitlab.com/api/v4";
  private readonly apiKey: string;
  constructor(apiKey: string) {
    super("GitLab");
    this.apiKey = apiKey;
  }

  // O path no GitLab precisa ser encodado (ex: "zofia/meu-projeto" vira "zofia%2Fmeu-projeto")
  private encodePath(path: string) {
    return encodeURIComponent(path);
  }

  async healthCheck() {
    const res = await fetch(`${this.baseUrl}/version`, {
      headers: { "PRIVATE-TOKEN": this.apiKey },
    });
    return { status: res.ok ? ("up" as const) : ("down" as const), latency: 0 };
  }

  async createRepository(name: string, isPrivate: boolean) {
    const res = await fetch(`${this.baseUrl}/projects`, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        visibility: isPrivate ? "private" : "public",
      }),
    });
    const data = await res.json();
    return { url: data.web_url, id: data.id.toString() };
  }

  async createFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newName: string
  ) {
    // GitLab utiliza o conceito de 'fork' ou 'template_project_id'
    const res = await fetch(`${this.baseUrl}/projects/user_projects`, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        use_custom_template: true,
        template_name: templateRepo,
      }),
    });
    return res.json();
  }

  async findPackageFiles(owner: string, repo: string) {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/repository/tree?recursive=true`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    const files = await res.json();
    const targets = ["package.json", "requirements.txt", "go.mod"];
    return files
      .filter((f: any) => targets.includes(f.name))
      .map((f: any) => ({ name: f.name, path: f.path, downloadUrl: f.path }));
  }

  async getRepoStats(owner: string, repo: string) {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(`${this.baseUrl}/projects/${projectPath}`, {
      headers: { "PRIVATE-TOKEN": this.apiKey },
    });
    const d = await res.json();
    return {
      stars: d.star_count,
      forks: d.forks_count,
      openIssues: d.open_issues_count,
      watchers: 0, // GitLab não tem "watchers" da mesma forma que GitHub
      size: d.statistics?.repository_size || 0,
    };
  }

  async getRecentActivity(
    owner: string,
    repo: string,
    limit = 10
  ): Promise<GitActivity[]> {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/events?action=pushed&per_page=${limit}`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    const events = await res.json();
    return events.map((e: any) => ({
      id: e.id,
      type: "push",
      author: e.author_username,
      message: e.push_data?.commit_title || "Push event",
      date: e.created_at,
      url: "",
    }));
  }

  async getLatestWorkflowRuns(owner: string, repo: string, limit = 5) {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/pipelines?per_page=${limit}`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    const pipelines = await res.json();
    return pipelines.map((p: any) => ({
      id: p.id,
      name: `Pipeline #${p.id}`,
      status: p.status === "failed" ? "failure" : p.status,
      duration: 0,
      author: p.user?.username,
      createdAt: p.created_at,
    }));
  }

  async getLanguages(owner: string, repo: string) {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/languages`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    return await res.json();
  }

  async getContent(owner: string, repo: string, path: string) {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const filePath = this.encodePath(path);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/repository/files/${filePath}/raw?ref=main`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    return await res.text();
  }

  async listBranchesSecurity(owner: string, repo: string) {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/protected_branches`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    const data = await res.json();
    return data.map((b: any) => ({
      name: b.name,
      protectionUrl: "Internal GitLab Policy",
    }));
  }

  async getPullRequestAnalysis(
    owner: string,
    repo: string
  ): Promise<PRAnalysis> {
    const projectPath = this.encodePath(`${owner}/${repo}`);
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/merge_requests?state=merged&per_page=10`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );
    const mrs = await res.json();
    // Lógica de cálculo idêntica à do GitHub...
    return { avgMergeTimeHours: 0, count: mrs.length };
  }

  async getTopContributors(
    owner: string,
    repo: string
  ): Promise<{ login: string; contributions: number }[]> {
    const projectPath = this.encodePath(`${owner}/${repo}`);

    // Opcionalmente podemos ordenar por commits via query params
    const res = await fetch(
      `${this.baseUrl}/projects/${projectPath}/repository/contributors?per_page=5&order_by=commits&sort=desc`,
      {
        headers: { "PRIVATE-TOKEN": this.apiKey },
      }
    );

    if (!res.ok) {
      throw new Error(`GitLab API error: ${res.statusText}`);
    }

    const data = await res.json();

    return data.map((c: any) => ({
      // No GitLab, usamos o name ou email como identificador do contribuidor
      login: c.name || c.email,
      contributions: c.commits,
    }));
  }
}
