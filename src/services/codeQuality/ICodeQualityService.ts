export interface SeverityItem {
  name: string;
  value: number;
}

export interface ProjectHistoryPoint {
  date: string;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage: number;
  technicalDebt: number;
}

export interface QualityGateCondition {
  metric: string;
  value: string | number;
  threshold: string | number;
  status: "OK" | "ERROR" | "WARN";
}

export interface RecentIssue {
  id: string;
  type: "BUG" | "VULNERABILITY" | "CODE_SMELL";
  severity: "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "INFO";
  file: string;
  line?: number;
  message: string;
  assignee?: string;
  created: string;
}

export interface ProjectMetrics {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage: number;
  duplications: number;
  securityRating: string;
  technicalDebt: number;
  status: "OK" | "ERROR" | "WARN";
  severity: SeverityItem[];
}

export interface FullDashboardData {
  metrics: ProjectMetrics;
  history: ProjectHistoryPoint[];
  qualityGate: QualityGateCondition[];
  issues: RecentIssue[];
}
export interface ICodeQualityService {
  healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;

  createProject(name: string, key: string): Promise<any>;

  // Define a "stack" ou tags para facilitar a organização
  setProjectTags(projectKey: string, tags: string[]): Promise<void>;

  getProjectMetrics(projectKey: string): Promise<ProjectMetrics>;
  getProjectHistory(projectKey: string): Promise<ProjectHistoryPoint[]>;
  getRecentIssues(projectKey: string): Promise<RecentIssue[]>;
  getQualityGateStatus(projectKey: string): Promise<QualityGateCondition[]>;
  getFullDashboardData(projectKey: string): Promise<FullDashboardData>;

  // Gestão de Acesso e Governança
  createUser(username: string, name: string, email: string): Promise<any>;
  createGroup(name: string): Promise<any>;
  associateUserToProject(
    projectKey: string,
    login: string,
    permissions: string[]
  ): Promise<void>;
  associateGroupToProject(
    projectKey: string,
    groupName: string,
    permissions: string[]
  ): Promise<void>;
  generateProjectAnalysisToken(projectName: string): Promise<string>;
  // Qualidade
  setDefaultQualityGate(projectKey: string, gateKey: string): Promise<void>;
}
