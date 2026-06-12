import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../../errors/IntegrationError";
import { date } from "../../../lib/dayjs";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { InMemorySonarQubeRepository } from "../../../repositories/in-memory/InMemorySonarQubeRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import { GetSonarQubeHistoryUseCase } from "./GetSonarQubeHistoryUseCase";

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let sonarRepository: InMemorySonarQubeRepository;
let sut: GetSonarQubeHistoryUseCase;

describe("GetSonarQubeHistoryUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();
    sonarRepository = new InMemorySonarQubeRepository();
    sut = new GetSonarQubeHistoryUseCase(
      projectIntegrationRepository,
      sonarRepository,
    );
  });

  it("deve retornar histórico de métricas do SonarQube", async () => {
    const projectId = randomUUID();
    const integrationTypeId = randomUUID();

    projectIntegrationRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
    });
    projectIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "SonarQube",
      slug: IntegrationType.SONARQUBE,
      logo: null,
    });
    projectIntegrationRepository.organizationIntegrations.push({
      id: randomUUID(),
      organizationId: randomUUID(),
    });

    await projectIntegrationRepository.create({
      projectId,
      integrationTypeId,
      organizationIntegrationId:
        projectIntegrationRepository.organizationIntegrations[0].id,
      enabled: true,
    });

    await sonarRepository.saveSnapshot(projectId, {
      metrics: {
        bugs: 2,
        vulnerabilities: 1,
        codeSmells: 5,
        coverage: 80,
        duplications: 1,
        technicalDebt: 120,
        status: "OK",
        securityRating: "A",
        severity: [],
      },
      qualityGate: [],
      issues: [],
    });

    const result = await sut.execute("projeto-alpha");

    expect(result).toHaveLength(1);
    expect(result[0].bugs).toBe(2);
    expect(result[0].date).toBe(date().format("MMM/YYYY"));
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() => sut.execute("inexistente")).rejects.toBeInstanceOf(
      IntegrationError,
    );
  });
});
