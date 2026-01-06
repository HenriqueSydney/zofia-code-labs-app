import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import { ISonarQubeRepository } from "@/repositories/ISonarQubeRepository";
import { SonarQubeService } from "@/services/codeQuality/SonarQubeService";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";

export class SyncSonarQubeMetricsUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private sonarQubeRepository: ISonarQubeRepository,
    private integrationFactory: IntegrationFactory
  ) {}

  async execute(projectSlug: string, userId: string) {
    // 1. Verifica se o projeto existe na nossa base
    const projectIntegration =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.SONARQUBE
      );

    if (!projectIntegration) {
      throw new Error(`Integração do Projeto com o SonarQube não encontrada.`);
    }

    // await checkUserPermissionForAsset(
    //   "organizationIntegration",
    //   userId,
    //   project,
    //   "UPDATE"
    // );

    const service =
      await this.integrationFactory.getIntegration<SonarQubeService>(
        projectIntegration.organizationIntegration.organizationId,
        IntegrationType.SONARQUBE
      );

    // 2. Busca dados atualizados da API do SonarQube
    // Este método já retorna metrics, history, qualityGate e issues
    const fullData = await service.getFullDashboardData("filesafe-hub");

    // 3. Salva o snapshot na base histórica
    await this.sonarQubeRepository.saveSnapshot(
      projectIntegration.projectId,
      fullData
    );

    return fullData;
  }
}
