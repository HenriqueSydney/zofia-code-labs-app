import { ResourceNotFoundError } from "@/errors";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IGetSprintMetricsUseCaseParams {
  projectSlug: string;
  userId: string;
}

export class GetSprintMetricsUseCase {
  constructor(
    private statsRepo: IProjectStatsRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({ projectSlug, userId }: IGetSprintMetricsUseCaseParams) {
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new ResourceNotFoundError("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "READ");
    const metrics = await this.statsRepo.getSprintMetrics(project.id);

    return {
      burndown: metrics.currentSprintBurndown,
      history: metrics.sprintHistory.map((sprint) => ({
        name: sprint.name,
        planned: sprint.planned,
        completed: sprint.completed,
      })),
    };
  }
}
