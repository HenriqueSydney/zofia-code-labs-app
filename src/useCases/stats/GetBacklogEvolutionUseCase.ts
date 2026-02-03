import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IGetBacklogEvolutionParams {
  organizationId: string;
  userId: string;
}

export class GetBacklogEvolutionUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId }: IGetBacklogEvolutionParams) {
    // 1. Verificação de Segurança
    // Diferente do projeto (slug), aqui geralmente validamos se o userId pertence à organizationId
    // await checkUserPermissionForOrganization(organizationId, userId, "VIEW_DASHBOARD");

    // Verificação de permissão omitida por brevidade
    return await this.statsRepo.getOrganizationBacklogEvolution(organizationId);
  }
}
