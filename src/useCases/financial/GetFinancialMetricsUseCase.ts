import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";
import { formatCurrency } from "@/utils/formatCurrency";

interface IGetFinancialMetricsUseCaseParams {
  projectSlug: string;
  userId: string;
}

export class GetFinancialMetricsUseCase {
  constructor(
    private statsRepo: IProjectStatsRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({ projectSlug, userId }: IGetFinancialMetricsUseCaseParams) {
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "READ");

    const metrics = await this.statsRepo.getFinancialMetrics(project.id);

    return {
      cards: {
        totalReceived: formatCurrency(metrics.totalReceived),
        totalExpenses: formatCurrency(metrics.totalExpenses),
        trends: metrics.trends,
      },
      chartData: metrics.monthlyHistory, // Já vem formatado do Repository { month, revenue, expenses }
    };
  }
}
