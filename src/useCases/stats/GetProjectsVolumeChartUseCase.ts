// use-cases/dashboard/GetProjectsVolumeChartUseCase.ts
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IProjectStatsRepository } from "@/repositories/IProjectStatsRepository";

interface IGetProjectsVolumeChartUseCaseParams {
  organizationId: string;
  userId: string;
}

export class GetProjectsVolumeChartUseCase {
  constructor(private statsRepo: IProjectStatsRepository) {}

  async execute({
    organizationId,
    userId,
  }: IGetProjectsVolumeChartUseCaseParams) {
    await checkUserPermissionForAsset(
      "project",
      userId,
      { organizationId },
      "READ",
    );

    // 2. Busca dos dados
    const volumeData =
      await this.statsRepo.getProjectsVolumeChart(organizationId);

    // 3. Retorno
    // O Repository já retorna [{ month: "Jan", projects: 2 }, ...]
    // Nenhuma transformação complexa necessária aqui, apenas repasse.
    return volumeData;
  }
}
