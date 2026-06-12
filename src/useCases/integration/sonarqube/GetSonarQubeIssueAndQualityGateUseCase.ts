import { IntegrationError } from "@/errors";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import { SonarQubeService } from "@/services/codeQuality/SonarQubeService";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
import {
  QualityGateCondition,
  RecentIssue,
} from "@/services/codeQuality/ICodeQualityService";

interface GetSonarQubeIssueAndQualityGateUseCaseResponse {
  qualityGate: QualityGateCondition[];
  issues: RecentIssue[];
}

export class GetSonarQubeIssueAndQualityGateUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private integrationFactory: IntegrationFactory
  ) {}

  async execute(
    projectSlug: string,
    userId: string
  ): Promise<GetSonarQubeIssueAndQualityGateUseCaseResponse> {
    // 1. Localiza a integração do projeto
    const projectIntegration =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.SONARQUBE
      );

    if (!projectIntegration) {
      throw new IntegrationError("Integração SonarQube não encontrada para este projeto.", { statusCode: 404 });
    }

    // 2. Obtém a instância do serviço configurada (URL/Token)
    const service =
      await this.integrationFactory.getIntegration<SonarQubeService>({
        organizationId:
          projectIntegration.organizationIntegration.organizationId,
        type: IntegrationType.SONARQUBE,
      });

    projectSlug = "filesafe-hub";

    const [qualityGate, issues] = await Promise.all([
      service.getQualityGateStatus(projectSlug),
      service.getRecentIssues(projectSlug),
    ]);

    return {
      qualityGate,
      issues,
    };
  }
}
