import { AppError } from "@/errors/AppError";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import {
  IUmamiRepository,
  UmamiMetricsWithTrend,
} from "@/repositories/IUmamiRepository";
import { IntegrationType } from "@/services/IntegrationFactory";
import { calculateTrend } from "@/utils/calculateTrend";

interface GetMetricsRequest {
  userId: string;
  projectSlug: string;
}

export interface MetricsResponse {
  metrics: UmamiMetricsWithTrend;
}

export class GetUmamiMetricsUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private umamiRepository: IUmamiRepository
  ) {}

  async execute({ projectSlug }: GetMetricsRequest): Promise<MetricsResponse> {
    // 1. Busca o vínculo do projeto e verifica se a integração Umami existe
    const projectLink =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.UMAMI
      );

    if (!projectLink) {
      throw new AppError(
        "Integração com Umami não configurada para este projeto.",
        404
      );
    }

    // 2. Define o período de comparação (30 dias)
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 15);

    // 3. Busca Snapshots: O mais recente e o de 30 dias atrás para tendência
    const [currentSnapshot, pastSnapshot] = await Promise.all([
      this.umamiRepository.getLatestSnapshot(projectLink.projectId),
      this.umamiRepository.getSnapshotAt(projectLink.projectId, thirtyDaysAgo),
    ]);

    if (!currentSnapshot) {
      throw new AppError(
        "Nenhum dado de analytics encontrado. Aguarde a próxima sincronização.",
        404
      );
    }

    // 4. Mapeamento das métricas com cálculo de tendências
    const metrics: UmamiMetricsWithTrend = {
      pageviews: currentSnapshot.pageviews,
      visitors: currentSnapshot.visitors,
      visits: currentSnapshot.visits,
      bounceRate: currentSnapshot.bounceRate,
      avgDuration: currentSnapshot.avgDuration,
      pagesPerSession: currentSnapshot.pagesPerSession,
      breakdown: currentSnapshot.breakdown,

      trends: {
        pageviews: calculateTrend(
          currentSnapshot.pageviews,
          pastSnapshot?.pageviews
        ),
        visitors: calculateTrend(
          currentSnapshot.visitors,
          pastSnapshot?.visitors
        ),
        bounceRate: calculateTrend(
          currentSnapshot.bounceRate,
          pastSnapshot?.bounceRate
        ),
        avgDuration: calculateTrend(
          currentSnapshot.avgDuration,
          pastSnapshot?.avgDuration
        ),
        pagesPerSession: calculateTrend(
          currentSnapshot.pagesPerSession,
          pastSnapshot?.pagesPerSession
        ),
      },
    };

    return {
      metrics,
    };
  }
}
