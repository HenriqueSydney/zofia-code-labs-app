import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExternalServiceError } from "../../../errors/ExternalServiceError";
import { ValidationError } from "../../../errors/ValidationError";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { InMemoryUmamiRepository } from "../../../repositories/in-memory/InMemoryUmamiRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import { GetUmamiMetricsUseCase } from "./GetUmamiMetricsUseCase";

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let umamiRepository: InMemoryUmamiRepository;
let sut: GetUmamiMetricsUseCase;

describe("GetUmamiMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();
    umamiRepository = new InMemoryUmamiRepository();
    sut = new GetUmamiMetricsUseCase(
      projectIntegrationRepository,
      umamiRepository,
    );
  });

  async function seedIntegration(projectId: string) {
    const integrationTypeId = randomUUID();

    projectIntegrationRepository.projects.push({
      id: projectId,
      slug: "projeto-alpha",
    });
    projectIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "Umami",
      slug: IntegrationType.UMAMI,
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

  it("deve retornar métricas do Umami com tendências", async () => {
    const projectId = randomUUID();
    await seedIntegration(projectId);

    await umamiRepository.saveSnapshot(projectId, {
      pageviews: 1000,
      visitors: 500,
      visits: 700,
      bounceRate: 40,
      avgDuration: 120,
      pagesPerSession: 2.5,
      totalTime: 84000,
      breakdown: {
        browsers: [],
        os: [],
        devices: [],
        countries: [],
        pages: [],
        referrers: [],
        history: { pageviews: [], sessions: [] },
        hourlyHistory: { pageviews: [], sessions: [] },
      },
    });

    const result = await sut.execute({
      userId: randomUUID(),
      projectSlug: "projeto-alpha",
    });

    expect(result.metrics.pageviews).toBe(1000);
    expect(result.metrics.trends.pageviews).toBeDefined();
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

  it("deve lançar ExternalServiceError quando integração não está configurada", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
      }),
    ).rejects.toBeInstanceOf(ExternalServiceError);
  });
});
