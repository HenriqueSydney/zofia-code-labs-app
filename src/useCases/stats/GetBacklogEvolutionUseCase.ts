import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IGetBacklogEvolutionParams {
  organizationId: string;
  userId: string;
}

export class GetBacklogEvolutionUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({ organizationId, userId }: IGetBacklogEvolutionParams) {
    await checkUserPermissionForAsset(
      "project",
      userId,
      { organizationId },
      "READ",
    );

    return await this.statsRepo.getOrganizationBacklogEvolution(organizationId);
  }
}
