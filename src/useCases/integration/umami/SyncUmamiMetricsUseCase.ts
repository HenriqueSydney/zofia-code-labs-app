import { IntegrationError, ExternalServiceError } from "@/errors";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import { IUmamiRepository } from "@/repositories/IUmamiRepository";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
import { UmamiWebAnalyticsService } from "@/services/webAnalytics/UmamiWebAnalyticsService";

export class SyncUmamiMetricsUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private umamiRepository: IUmamiRepository,
    private integrationFactory: IntegrationFactory
  ) {}

  async execute(projectSlug: string, userId: string) {
    // 1. Verifica se a integração do projeto existe
    const projectIntegration =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.UMAMI
      );

    if (!projectIntegration) {
      throw new IntegrationError(`Integração do Projeto com o Umami não encontrada.`);
    }

    // 2. Instancia o serviço através da Factory
    const service =
      await this.integrationFactory.getIntegration<UmamiWebAnalyticsService>({
        organizationId:
          projectIntegration.organizationIntegration.organizationId,
        type: IntegrationType.UMAMI,
      });

    /**
     * 3. Busca dados atualizados da API do Umami
     * Geralmente o Umami precisa de um range de datas.
     * Aqui buscamos os dados consolidados dos últimos 30 dias para o snapshot.
     */
    const websiteId = (projectIntegration.config as { externalId?: string } | null)
      ?.externalId;
    if (!websiteId) {
      throw new ExternalServiceError("ID do website não configurado na integração do Umami.");
    }

    const startAt = new Date();
    startAt.setDate(startAt.getDate() - 30);
    const endAt = new Date();

    const stats = await service.getCompleteAnalytics(
      websiteId,
      startAt.getTime(),
      endAt.getTime()
    );

    /**
     * 4. Salva o snapshot na base histórica
     * Mapeamos o retorno do serviço para o formato esperado pelo repositório
     */
    await this.umamiRepository.saveSnapshot(projectIntegration.projectId, {
      pageviews: stats.pageviews,
      visitors: stats.visitors,
      visits: stats.visits,
      bounceRate: stats.bounceRate,
      avgDuration: stats.avgDuration,
      pagesPerSession: stats.pagesPerSession,

      // totalTime pode ser calculado se necessário (visits * avgDuration)
      totalTime: stats.visits * stats.avgDuration,

      // O breakdown já contém browsers, os, devices, countries e history
      breakdown: stats.breakdown,
    });

    return stats;
  }
}
