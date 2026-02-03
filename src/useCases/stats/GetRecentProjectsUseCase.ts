// use-cases/dashboard/GetRecentProjectsUseCase.ts
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";
import { formatCurrency } from "@/utils/formatCurrency";
import { date } from "@/lib/dayjs"; // Para formatar a data se quiser retornar string

interface IGetRecentProjectsUseCaseParams {
  organizationId: string;
  userId: string;
}

export class GetRecentProjectsUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId, userId }: IGetRecentProjectsUseCaseParams) {
    // 1. Verificação de Segurança
    // await checkUserPermissionForOrganization(organizationId, userId);

    // 2. Busca dos dados
    const projects = await this.statsRepo.getRecentProjects(organizationId);

    // 3. Formatação
    // Transformamos o DTO do banco para o formato de "Value Object" que sua tabela parece usar
    // Ex: { value: "Dado" } conforme seu exemplo original
    return projects.map((project) => ({
      id: project.id,
      name: {
        value: project.name,
      },
      client: {
        value: project.clientName,
        logo: project.clientLogo,
      },
      status: {
        value: project.status,
        health: project.health, // Importante para colorir o badge no front
      },
      date: {
        value: date(project.date).format("DD/MM/YYYY"), // Formatação visual
        original: project.date, // Mantendo data real para ordenação se precisar
        endDate: project.endDate,
      },
      budget: {
        value: formatCurrency(project.budget), // Aplica R$
      },
    }));
  }
}
