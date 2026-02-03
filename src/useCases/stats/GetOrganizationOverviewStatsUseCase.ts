// use-cases/dashboard/GetOrganizationOverviewStatsUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";
// Assumindo que você tenha um método para verificar permissão na organização ou confie no middleware
// import { checkUserPermissionForOrganization } from "@/lib/auth/checkUserPermission";

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
    // 1. Verificação de Segurança
    // Diferente do projeto (slug), aqui geralmente validamos se o userId pertence à organizationId
    // await checkUserPermissionForOrganization(organizationId, userId, "VIEW_DASHBOARD");

    // 2. Busca dos dados
    const stats = await this.statsRepo.getDashboardStats(organizationId);

    // 3. Formatação (se necessário, ou retorno direto do DTO)
    // Aqui retornamos no formato que os cards do shadcn esperam
    return [
      {
        title: "Total de Projetos",
        value: stats.totalProjects.value.toString(),
        trend: `${stats.totalProjects.trend > 0 ? "+" : ""}${stats.totalProjects.trend}%`,
        // O ícone deve ser resolvido no frontend para não quebrar a serialização do Server Component
        iconKey: "FolderKanban",
      },
      {
        title: "Projetos Ativos",
        value: stats.activeProjects.value.toString(),
        trend: `${stats.activeProjects.trend > 0 ? "+" : ""}${stats.activeProjects.trend}%`,
        iconKey: "TrendingUp",
      },
      {
        title: "Projetos Concluídos",
        value: stats.completedProjects.value.toString(),
        trend: `${stats.completedProjects.trend > 0 ? "+" : ""}${stats.completedProjects.trend}%`,
        iconKey: "CheckCircle2",
      },
      {
        title: "Satisfação (Saúde)",
        value: `${stats.clientSatisfaction.value}%`,
        trend: `${stats.clientSatisfaction.trend > 0 ? "+" : ""}${stats.clientSatisfaction.trend}%`,
        iconKey: "Users",
      },
    ];
  }
}
