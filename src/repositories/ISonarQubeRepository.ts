import {
  FullDashboardData,
  ProjectMetrics,
} from "@/services/codeQuality/ICodeQualityService";

export interface SonarProjectEntity {
  id: string;
  projectKey: string;
  projectName: string;
  organization: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SonarQualityGateConditionEntity {
  id: string;
  snapshotId: string;
  metric: string;
  value: string;
  threshold: string;
  status: "OK" | "ERROR" | "WARN";
}

export interface SonarSnapshotEntity {
  id: string;
  projectId: string;
  timestamp: Date;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage: number;
  duplications: number;
  technicalDebt: number;
  status: "OK" | "ERROR" | "WARN";
  securityRating: string;
  blockerViolations: number;
  criticalViolations: number;
  majorViolations: number;
  minorViolations: number;
  infoViolations: number;
  gateConditions?: SonarQualityGateConditionEntity[];
}

export interface MetricTrend {
  value: number;
  percentage: number;
}

export interface ProjectMetricsWithTrend extends ProjectMetrics {
  trends: {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    technicalDebt: number;
    coverage: number;
  };
}

export interface ISonarQubeRepository {
  saveSnapshot(projectId: string, data: FullDashboardData): Promise<void>;
  getSnapshotAt(
    projectId: string,
    date: Date
  ): Promise<SonarSnapshotEntity | null>;
  getLatestSnapshot(projectId: string): Promise<SonarSnapshotEntity | null>;
  getHistory(projectId: string, limit?: number): Promise<SonarSnapshotEntity[]>;
}
