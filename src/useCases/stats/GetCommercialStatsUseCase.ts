import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectsRepository } from "@/repositories/IProjectsRepository";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";
import { formatCurrency } from "@/utils/formatCurrency";

interface IGetCommercialStatsUseCaseParams {
  projectSlug: string;
  userId: string;
}

export class GetCommercialStatsUseCase {
  constructor(
    private statsRepo: IProjectStatsRepository,
    private projectsRepository: IProjectsRepository
  ) {}

  async execute({ projectSlug, userId }: IGetCommercialStatsUseCaseParams) {
    const project = await this.projectsRepository.findBySlug(projectSlug);

    if (!project) {
      throw new Error("Projeto não encontrado.");
    }

    await checkUserPermissionForAsset("project", userId, project, "READ");

    // Agora este método retorna { proposals, contracts, financials }
    const metrics = await this.statsRepo.getCommercialMetrics(project.id);

    return {
      cards: {
        // Card 1: Em Negociação (Funil)
        proposals: {
          value: formatCurrency(metrics.proposals.openValue),
          count: metrics.proposals.count,
          wonValue: formatCurrency(metrics.proposals.wonValue),
        },
        // Card 2: Contratos Ativos (Backlog de Receita)
        contracts: {
          value: formatCurrency(metrics.contracts.totalValue),
          count: metrics.contracts.activeCount,
        },
        // Card 3: Receita Realizada (Caixa)
        financials: {
          received: formatCurrency(metrics.financials.totalReceived),
        },
        // Card 4: Resultado Líquido (Lucro)
        result: {
          netValue: formatCurrency(metrics.financials.netResult),
          profitMargin: metrics.financials.profitMargin, // Já vem em número (ex: 20.5)
        },
      },
      // Nota: O método getCommercialMetrics ajustado anteriormente foca nos Cards (KPIs).
      // Se precisar do gráfico (monthlyHistory) aqui, você deve chamar também
      // o this.statsRepo.getFinancialMetrics(project.id) e mesclar o resultado.
    };
  }
}
