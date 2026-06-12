import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../../errors/IntegrationError";
import { ValidationError } from "../../../errors/ValidationError";
import { date } from "../../../lib/dayjs";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { InMemorySonarQubeRepository } from "../../../repositories/in-memory/InMemorySonarQubeRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import { GetSonarQubeMetricsUseCase } from "./GetSonarQubeMetricsUseCase";

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let sonarRepository: InMemorySonarQubeRepository;
let sut: GetSonarQubeMetricsUseCase;

describe("GetSonarQubeMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();
    sonarRepository = new InMemorySonarQubeRepository();
    sut = new GetSonarQubeMetricsUseCase(
      projectIntegrationRepository,
      sonarRepository,
    );
  });

  async function seedIntegration(projectId: string, slug = "projeto-alpha") {
    const integrationTypeId = randomUUID();

    projectIntegrationRepository.projects.push({ id: projectId, slug });
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
  }

  it("deve retornar métricas atuais com tendências", async () => {
    const projectId = randomUUID();
    await seedIntegration(projectId);

    await sonarRepository.saveSnapshot(projectId, {
      metrics: {
        bugs: 4,
        vulnerabilities: 2,
        codeSmells: 10,
        coverage: 75,
        duplications: 3,
        technicalDebt: 180,
        status: "OK",
        securityRating: "B",
        severity: [
          { name: "Blocker", value: 0 },
          { name: "Critical", value: 1 },
          { name: "Major", value: 2 },
          { name: "Minor", value: 3 },
          { name: "Info", value: 4 },
        ],
      },
      qualityGate: [],
      issues: [],
    });

    const result = await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
    });

    expect(result.metrics.bugs).toBe(4);
    expect(result.metrics.severity).toHaveLength(5);
    expect(result.metrics.trends.bugs).toBeDefined();
  });

  it("deve lançar ValidationError quando não há snapshot", async () => {
    const projectId = randomUUID();
    await seedIntegration(projectId);

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "projeto-alpha",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve lançar IntegrationError quando integração não está configurada", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
      }),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});
