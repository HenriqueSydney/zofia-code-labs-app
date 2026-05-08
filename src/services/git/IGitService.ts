import { MinimalRepositoryListDTO } from "@/dto/github/RepositoriesDTO";

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

export type PRDetail = {
  id: number;
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  url: string;
};

export type PRAnalysis = {
  avgMergeTimeHours: number;
  mergedCount: number;
  closedCount: number;
  latestMergedPRs: PRDetail[];
};

export type CommitStat = {
  date: string;
  count: number;
};

export type CommitData = {
  commitsRaw: any;
  stats: CommitStat[];
};

export interface GitIntegrationConfig {
  externalId: string;
  name: string;
  full_name: string;
  provider: string;
  [key: string]: any;
}

export interface IGitService {
  /**
   * Métodos Globais / Gerenciamento
   * Exigem owner pois podem atuar fora do contexto do projeto atual
   */
  listRepositories(owner: string): Promise<MinimalRepositoryListDTO>;

  createRepository(
    name: string,
    isPrivate: boolean
  ): Promise<{ url: string; id: string }>;

  createFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newName: string
  ): Promise<any>;

  /**
   * Métricas e Inspeção de Código
   * Contexto de owner/repo injetado via construtor na implementação
   */

  // Conteúdo e Arquivos
  findPackageFiles(): Promise<
    { name: string; path: string; downloadUrl: string }[]
  >;
  getContent(path: string): Promise<string>;

  // Dashboard & Stats (Dados em tempo real)
  getRepoStats(): Promise<RepoStats>;
  getCommitStats(): Promise<CommitData>; // Novo método para o gráfico de linha

  getRecentActivity(limit?: number): Promise<GitActivity[]>;
  getLatestWorkflowRuns(limit?: number): Promise<WorkflowRun[]>;

  // Métricas de Engenharia e Equipe
  getTopContributors(): Promise<{ login: string; contributions: number }[]>;
  getLanguages(): Promise<Record<string, number>>;
  getPullRequestAnalysis(): Promise<PRAnalysis>;

  // Governança e Segurança
  listBranchesSecurity(): Promise<BranchSecurity[]>;
}
