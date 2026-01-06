export type RepoStats = {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  size: number;
};

export type GitActivity = {
  id: string;
  type: "push" | "merge" | "pull_request" | "other";
  author: string;
  message: string;
  date: string;
  url: string;
};

export type WorkflowRun = {
  id: number;
  name: string;
  status: "success" | "failure" | "in_progress" | "queued" | "cancelled";
  duration: number;
  author: string;
  createdAt: string;
};

export type BranchSecurity = {
  name: string;
  protectionUrl?: string;
};

export type PRAnalysis = {
  avgMergeTimeHours: number;
  count: number;
};

export interface IGitService {
  // Gerenciamento de Repositórios
  createRepository(
    name: string,
    isPrivate: boolean
  ): Promise<{ url: string; id: string }>;
  createFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newName: string
  ): Promise<any>;

  // Inspeção de Código e Conteúdo
  findPackageFiles(
    owner: string,
    repo: string
  ): Promise<{ name: string; path: string; downloadUrl: string }[]>;
  getContent(owner: string, repo: string, path: string): Promise<string>;

  // Dashboard & Stats
  getRepoStats(owner: string, repo: string): Promise<RepoStats>;
  getRecentActivity(
    owner: string,
    repo: string,
    limit?: number
  ): Promise<GitActivity[]>;
  getLatestWorkflowRuns(
    owner: string,
    repo: string,
    limit?: number
  ): Promise<WorkflowRun[]>;

  // Métricas de Engenharia e Equipe
  getTopContributors(
    owner: string,
    repo: string
  ): Promise<{ login: string; contributions: number }[]>;
  getLanguages(owner: string, repo: string): Promise<Record<string, number>>;
  getPullRequestAnalysis(owner: string, repo: string): Promise<PRAnalysis>;

  // Governança
  listBranchesSecurity(owner: string, repo: string): Promise<BranchSecurity[]>;
}
