import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { BACKLOG_STATUS_TRANSLATION_KEYS } from "@/mappers/BacklogMappers";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IGetBacklogMetricsUseCaseParams {
  projectSlug: string;
  userId: string;
}

export class GetBacklogMetricsUseCase {
  constructor(
    private statsRepo: IProjectStatsRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({ projectSlug, userId }: IGetBacklogMetricsUseCaseParams) {
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "READ");

    const metrics = await this.statsRepo.getBacklogMetrics(project.id);

    return {
      cards: {
        totalTasks: String(metrics.totalTasks),
        completedTasks: String(metrics.completedTasks),
        progress:
          metrics.totalTasks > 0
            ? `${((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(
                0
              )}%`
            : "0%",
        trends: metrics.trends,
      },
      chartData: metrics.statusDistribution.map((item) => ({
        name: BACKLOG_STATUS_TRANSLATION_KEYS[item.status],
        value: item.count,
      })),
    };
  }
}
