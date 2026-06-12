// use-cases/dashboard/GetOrganizationOverviewStatsUseCase.ts
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IGetOrganizationOverviewStatsUseCaseParams {
  organizationId: string;
  userId: string;
}

export class GetOrganizationOverviewStatsUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({
    organizationId,
    userId,
  }: IGetOrganizationOverviewStatsUseCaseParams) {
    await checkUserPermissionForAsset(
      "project",
      userId,
      { organizationId },
      "READ",
    );

    // 2. Busca dos dados
    const stats = await this.statsRepo.getDashboardStats(organizationId);

    // 3. Formatação (se necessário, ou retorno direto do DTO)
    // Aqui retornamos no formato que os cards do shadcn esperam
    return [
      {
        titleKey: "totalProjects",
        value: stats.totalProjects.value.toString(),
        trend: `${stats.totalProjects.trend > 0 ? "+" : ""}${stats.totalProjects.trend}%`,
        iconKey: "FolderKanban",
      },
      {
        titleKey: "activeProjects",
        value: stats.activeProjects.value.toString(),
        trend: `${stats.activeProjects.trend > 0 ? "+" : ""}${stats.activeProjects.trend}%`,
        iconKey: "TrendingUp",
      },
      {
        titleKey: "completedProjects",
        value: stats.completedProjects.value.toString(),
        trend: `${stats.completedProjects.trend > 0 ? "+" : ""}${stats.completedProjects.trend}%`,
        iconKey: "CheckCircle2",
      },
      {
        titleKey: "clientSatisfaction",
        value: `${stats.clientSatisfaction.value}%`,
        trend: `${stats.clientSatisfaction.trend > 0 ? "+" : ""}${stats.clientSatisfaction.trend}%`,
        iconKey: "Users",
      },
    ];
  }
}
