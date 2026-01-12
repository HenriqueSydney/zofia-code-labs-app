import { AppError } from "@/errors/AppError";
import { date } from "@/lib/dayjs";
import { IProjectIntegrationRepository } from "@/repositories/IProjectIntegrationRepository";
import {
  ISonarQubeRepository,
  SonarSnapshotEntity,
} from "@/repositories/ISonarQubeRepository";
import { IntegrationType } from "@/services/IntegrationFactory";

export interface HistoryResponse {
  date: string;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage: number;
}

export class GetSonarQubeHistoryUseCase {
  constructor(
    private projectIntegrationRepository: IProjectIntegrationRepository,
    private sonarRepository: ISonarQubeRepository
  ) {}

  async execute(projectSlug: string): Promise<HistoryResponse[]> {
    // 1. Busca o vínculo do projeto
    const projectLink =
      await this.projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.SONARQUBE
      );

    if (!projectLink) throw new AppError("Integração não encontrada.", 404);

    // 2. Busca o histórico (limitado aos últimos 12 registros/meses por padrão)
    const history = await this.sonarRepository.getHistory(
      projectLink.projectId,
      12
    );

    // 3. Mapeia e inverte o array (o repo traz desc, o gráfico precisa de asc)
    return history.reverse().map((snapshot) => ({
      date: date(snapshot.timestamp).format("MMM/YYYY"),
      bugs: snapshot.bugs,
      vulnerabilities: snapshot.vulnerabilities,
      codeSmells: snapshot.codeSmells,
      coverage: snapshot.coverage,
      // Convertendo minutos para horas para o gráfico de barras
      technicalDebt: Math.round(snapshot.technicalDebt / 60),
    }));
  }
}
