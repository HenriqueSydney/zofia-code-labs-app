import { randomBytes } from "node:crypto";
import { IntegrationBase } from "../IntegrationBase";
import {
  IProjectLinkable,
  SetupProjectParams,
  SetupProjectResult,
} from "../IProjectLinkable";
import {
  FullDashboardData,
  ICodeQualityService,
  ProjectHistoryPoint,
  ProjectMetrics,
  QualityGateCondition,
  RecentIssue,
} from "./ICodeQualityService";

export class SonarQubeService
  extends IntegrationBase
  implements ICodeQualityService, IProjectLinkable
{
  private baseUrl: string;
  private token: string;

  constructor(config: { baseUrl?: string; token: string }) {
    super("sonarqube");
    this.baseUrl = (
      config.baseUrl ||
      process.env.SONARQUBE_URL ||
      "http://sonarqube:9000"
    ).replace(/\/$/, "");
    this.token = config.token || "";
  }

  /**
   * Verifica o status do sistema SonarQube
   */
  async healthCheck(): Promise<{ status: "up" | "down"; latency: number }> {
    const start = performance.now();
    try {
      // Endpoint oficial de health do Sonar
      const response = await fetch(`${this.baseUrl}/api/system/health`, {
        headers: this.getAuthHeader(),
        signal: AbortSignal.timeout(5000),
      });

      const data = await response.json();
      const end = performance.now();

      return {
        // Sonar retorna GREEN, YELLOW ou RED
        status:
          data.health === "GREEN" || data.health === "YELLOW" ? "up" : "down",
        latency: Math.round(end - start),
      };
    } catch (error) {
      return { status: "down", latency: Math.round(performance.now() - start) };
    }
  }

  private getAuthHeader() {
    // SonarQube usa Basic Auth com o Token no lugar do username e senha vazia
    const auth = Buffer.from(`${this.token}:`).toString("base64");
    return { Authorization: `Basic ${auth}` };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeader(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `[SonarQube Error] ${response.status}: ${JSON.stringify(error)}`
      );
    }

    // Algumas rotas do Sonar retornam 204 No Content
    if (response.status === 204) return {} as T;

    return response.json() as Promise<T>;
  }

  async createProject(name: string, key: string): Promise<any> {
    const params = new URLSearchParams({ name, project: key });
    return this.request(`/api/projects/create?${params}`, { method: "POST" });
  }

  async setProjectTags(projectKey: string, tags: string[]): Promise<void> {
    const params = new URLSearchParams({
      project: projectKey,
      tags: tags.join(","),
    });
    await this.request(`/api/project_tags/set?${params}`, { method: "POST" });
  }

  async getProjectMetrics(projectKey: string): Promise<ProjectMetrics> {
    const metrics = [
      "bugs",
      "vulnerabilities",
      "code_smells",
      "coverage",
      "sqale_index",
      "alert_status",
      "duplicated_lines_density",
      "reliability_rating",
      "security_rating",
      "sqale_rating",
      "blocker_violations",
      "critical_violations",
      "major_violations",
      "minor_violations",
      "info_violations",
    ].join(",");

    const data: any = await this.request(
      `/api/measures/component?component=${projectKey}&metricKeys=${metrics}`
    );

    const measures = data.component.measures;

    // Helper para extrair o valor da métrica do array do Sonar
    const findValue = (key: string) =>
      measures.find((m: any) => m.metric === key)?.value;

    // Helper para converter o rating numérico (1.0) em letra (A)
    const formatRating = (val: string | undefined) => {
      if (!val) return "N/A";
      const map: Record<string, string> = {
        "1.0": "A",
        "2.0": "B",
        "3.0": "C",
        "4.0": "D",
        "5.0": "E",
      };
      return map[val] || val;
    };

    return {
      bugs: Number(findValue("bugs") || 0),
      vulnerabilities: Number(findValue("vulnerabilities") || 0),
      codeSmells: Number(findValue("code_smells") || 0),
      coverage: Number(findValue("coverage") || 0),
      duplications: Number(findValue("duplicated_lines_density") || 0),
      technicalDebt: Number(findValue("sqale_index") || 0),
      securityRating: formatRating(findValue("security_rating")),
      status: (findValue("alert_status") as "OK" | "ERROR" | "WARN") || "OK",

      // Formatação específica para o PieChart do seu dashboard
      severity: [
        {
          name: "Blocker",
          value: Number(findValue("blocker_violations") || 0),
        },
        {
          name: "Critical",
          value: Number(findValue("critical_violations") || 0),
        },
        { name: "Major", value: Number(findValue("major_violations") || 0) },
        { name: "Minor", value: Number(findValue("minor_violations") || 0) },
        { name: "Info", value: Number(findValue("info_violations") || 0) },
      ],
    };
  }

  async getProjectHistory(projectKey: string): Promise<ProjectHistoryPoint[]> {
    const metricKeys = [
      "bugs",
      "vulnerabilities",
      "code_smells",
      "coverage",
      "sqale_index",
    ].join(",");

    const data = await this.request<{
      measures: Array<{
        metric: string;
        history: Array<{ date: string; value?: string }>;
      }>;
    }>(
      `/api/measures/search_history?component=${projectKey}&metrics=${metricKeys}`
    );

    const historyMap = new Map<string, ProjectHistoryPoint>();

    data.measures.forEach((m) => {
      const prop = this.mapMetricToProp(m.metric);
      m.history.forEach((h) => {
        const dateKey = new Date(h.date).toISOString().split("T")[0]; // YYYY-MM-DD para agrupamento
        const existing = historyMap.get(dateKey) || {
          date: new Date(h.date).toLocaleDateString("pt-BR", {
            month: "short",
          }),
          bugs: 0,
          vulnerabilities: 0,
          codeSmells: 0,
          coverage: 0,
          technicalDebt: 0,
        };

        if (h.value) (existing as any)[prop] = Number(h.value);
        historyMap.set(dateKey, existing);
      });
    });

    return Array.from(historyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  private mapMetricToProp(metric: string): string {
    const map: Record<string, string> = {
      sqale_index: "technicalDebt",
      code_smells: "codeSmells",
    };
    return map[metric] || metric;
  }

  async getRecentIssues(projectKey: string): Promise<RecentIssue[]> {
    const data = await this.request<{ issues: any[] }>(
      `/api/issues/search?component=${projectKey}&ps=5&s=CREATION_DATE&asc=false`
    );

    return data.issues.map((issue) => ({
      id: issue.key,
      type: issue.type,
      severity: issue.severity,
      file: issue.component.split(":").pop() || issue.component, // Remove o prefixo do projeto
      line: issue.line,
      message: issue.message,
      assignee: issue.assignee,
      created: new Date(issue.creationDate).toLocaleDateString("pt-BR"),
    }));
  }

  async getQualityGateStatus(
    projectKey: string
  ): Promise<QualityGateCondition[]> {
    const data = await this.request<any>(
      `/api/qualitygates/project_status?projectKey=${projectKey}`
    );

    return data.projectStatus.conditions.map((c: any) => ({
      metric: c.metricKey.replace(/_/g, " "), // Melhora legibilidade: "new_coverage" -> "new coverage"
      value: c.actualValue || 0,
      threshold: c.errorThreshold || 0,
      status:
        c.status === "OK" ? "OK" : c.status === "ERROR" ? "ERROR" : "WARN",
    }));
  }

  async getFullDashboardData(projectKey: string): Promise<FullDashboardData> {
    const [metrics, history, qualityGate, issues] = await Promise.all([
      this.getProjectMetrics(projectKey),
      this.getProjectHistory(projectKey),
      this.getQualityGateStatus(projectKey),
      this.getRecentIssues(projectKey),
    ]);

    return { metrics, history, qualityGate, issues };
  }
  async createUser(
    username: string,
    name: string,
    email: string
  ): Promise<any> {
    const params = new URLSearchParams({
      login: username,
      name,
      email,
      password: crypto.randomUUID(), // Senha aleatória, deve ser alterada via email/reset
    });
    return this.request(`/api/users/create?${params}`, { method: "POST" });
  }

  async createGroup(name: string): Promise<any> {
    const params = new URLSearchParams({ name });
    return this.request(`/api/user_groups/create?${params}`, {
      method: "POST",
    });
  }

  async associateUserToProject(
    projectKey: string,
    login: string,
    permissions: string[] = ["codeviewer", "scan"]
  ): Promise<void> {
    for (const permission of permissions) {
      const params = new URLSearchParams({ projectKey, login, permission });
      await this.request(`/api/permissions/add_user?${params}`, {
        method: "POST",
      });
    }
  }

  async associateGroupToProject(
    projectKey: string,
    groupName: string,
    permissions: string[] = ["codeviewer"]
  ): Promise<void> {
    for (const permission of permissions) {
      const params = new URLSearchParams({ projectKey, groupName, permission });
      await this.request(`/api/permissions/add_group?${params}`, {
        method: "POST",
      });
    }
  }

  async setDefaultQualityGate(
    projectKey: string,
    gateKey: string
  ): Promise<void> {
    const params = new URLSearchParams({ projectKey, gateKey });
    await this.request(`/api/qualitygates/select?${params}`, {
      method: "POST",
    });
  }

  async generateProjectAnalysisToken(projectName: string): Promise<string> {
    const tokenName = `pipeline-${projectName}-${randomBytes(4).toString(
      "hex"
    )}`;

    const params = new URLSearchParams({
      name: tokenName,
      type: "PROJECT_ANALYSIS_TOKEN",
    });

    const data: any = await this.request(
      `/api/user_tokens/generate?${params}`,
      {
        method: "POST",
      }
    );

    return data.token;
  }

  async setupProject({
    projectName,
    projectSlug,
  }: SetupProjectParams): Promise<SetupProjectResult> {
    // 1. Cria o projeto
    await this.createProject(projectName, projectSlug);

    // 2. Define Quality Gate padrão (ex: o ID do seu gate 'Zofia-Standard')
    // await this.setDefaultQualityGate(projectKey, "1");

    await this.generateProjectAnalysisToken(projectSlug);

    return {
      externalId: projectSlug,
      metadata: { setupAt: new Date().toISOString() },
    };
  }
}
