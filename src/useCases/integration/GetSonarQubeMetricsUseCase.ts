import { AppError } from "@/errors/AppError";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import {
  ISonarQubeRepository,
  ProjectMetricsWithTrend,
} from "@/repositories/ISonarQubeRepository";
import {
  IntegrationType,
  IntegrationFactory,
} from "@/services/IntegrationFactory";
import { SonarQubeService } from "@/services/codeQuality/SonarQubeService";
import { calculateTrend } from "@/utils/calculateTrend";

interface GetMetricsRequest {
  userId: string;
  projectSlug: string;
}

interface MetricsResponse {
  metrics: ProjectMetricsWithTrend;
}

export class GetSonarQubeMetricsUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private sonarQubeRepository: ISonarQubeRepository
  ) {}

  async execute({
    userId,
    projectSlug,
  }: GetMetricsRequest): Promise<MetricsResponse> {
    // 1. Busca o vínculo do projeto
    const projectLink =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.SONARQUBE
      );

    if (!projectLink) {
      throw new AppError("Integração não configurada.", 404);
    }

    // 3. Busca Snapshots: O atual e o de 30 dias atrás
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [currentSnapshot, pastSnapshot] = await Promise.all([
      this.sonarQubeRepository.getLatestSnapshot(projectLink.projectId),
      this.sonarQubeRepository.getSnapshotAt(
        projectLink.projectId,
        thirtyDaysAgo
      ),
    ]);

    if (!currentSnapshot) {
      throw new AppError(
        "Nenhum dado encontrado. Sincronize as métricas primeiro.",
        404
      );
    }
    // 4. Mapeamento das métricas com cálculo de tendências e reconstrução de 'severity'
    const metrics: ProjectMetricsWithTrend = {
      bugs: currentSnapshot.bugs,
      vulnerabilities: currentSnapshot.vulnerabilities,
      codeSmells: currentSnapshot.codeSmells,
      coverage: currentSnapshot.coverage,
      duplications: currentSnapshot.duplications,
      technicalDebt: currentSnapshot.technicalDebt,
      securityRating: currentSnapshot.securityRating,
      status: currentSnapshot.status,

      // RECONSTRUINDO O ARRAY DE SEVERIDADE PARA O DASHBOARD
      severity: [
        { name: "Blocker", value: currentSnapshot.blockerViolations },
        { name: "Critical", value: currentSnapshot.criticalViolations },
        { name: "Major", value: currentSnapshot.majorViolations },
        { name: "Minor", value: currentSnapshot.minorViolations },
        { name: "Info", value: currentSnapshot.infoViolations },
      ],

      trends: {
        bugs: calculateTrend(currentSnapshot.bugs, pastSnapshot?.bugs),
        vulnerabilities: calculateTrend(
          currentSnapshot.vulnerabilities,
          pastSnapshot?.vulnerabilities
        ),
        codeSmells: calculateTrend(
          currentSnapshot.codeSmells,
          pastSnapshot?.codeSmells
        ),
        technicalDebt: calculateTrend(
          currentSnapshot.technicalDebt,
          pastSnapshot?.technicalDebt
        ),
        coverage: calculateTrend(
          currentSnapshot.coverage,
          pastSnapshot?.coverage
        ),
      },
    };

    // 5. Configurações de Pipeline (Url do Host, etc)

    return {
      metrics,
    };
  }
}
