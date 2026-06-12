import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../../errors/IntegrationError";
import { ExternalServiceError } from "../../../errors/ExternalServiceError";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { InMemoryUmamiRepository } from "../../../repositories/in-memory/InMemoryUmamiRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import type { IntegrationFactory } from "../../../services/IntegrationFactory";
import { SyncUmamiMetricsUseCase } from "./SyncUmamiMetricsUseCase";

const analyticsPayload = {
  pageviews: 500,
  visitors: 200,
  visits: 300,
  bounceRate: 35,
  avgDuration: 90,
  pagesPerSession: 2,
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
};

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let umamiRepository: InMemoryUmamiRepository;
let getCompleteAnalytics: ReturnType<typeof vi.fn>;
let integrationFactory: IntegrationFactory;
let sut: SyncUmamiMetricsUseCase;

describe("SyncUmamiMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();
    umamiRepository = new InMemoryUmamiRepository();
    getCompleteAnalytics = vi.fn().mockResolvedValue(analyticsPayload);

    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue({ getCompleteAnalytics }),
    } as unknown as IntegrationFactory;

    sut = new SyncUmamiMetricsUseCase(
      projectIntegrationRepository,
      umamiRepository,
      integrationFactory,
    );
  });

  it("deve sincronizar métricas do Umami e persistir snapshot calculado", async () => {
    const projectId = randomUUID();
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();
    const organizationIntegrationId = randomUUID();
    const websiteId = "website-umami-123";

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
      id: organizationIntegrationId,
      organizationId,
    });

    await projectIntegrationRepository.create({
      projectId,
      integrationTypeId,
      organizationIntegrationId,
      enabled: true,
      config: { externalId: websiteId },
    });

    const result = await sut.execute("projeto-alpha", randomUUID());

    expect(result).toEqual(analyticsPayload);
    expect(integrationFactory.getIntegration).toHaveBeenCalledWith({
      organizationId,
      type: IntegrationType.UMAMI,
    });
    expect(getCompleteAnalytics).toHaveBeenCalledWith(
      websiteId,
      expect.any(Number),
      expect.any(Number),
    );
    expect(umamiRepository.items).toHaveLength(1);
    expect(umamiRepository.items[0]).toMatchObject({
      projectId,
      pageviews: 500,
      visitors: 200,
      visits: 300,
      bounceRate: 35,
      avgDuration: 90,
      pagesPerSession: 2,
      totalTime: 300 * 90,
    });
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() =>
      sut.execute("inexistente", randomUUID()),
    ).rejects.toMatchObject({
      name: "IntegrationError",
      message: "Integração do Projeto com o Umami não encontrada.",
    });
  });

  it("deve lançar ExternalServiceError quando websiteId não está configurado", async () => {
    const projectId = randomUUID();
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();
    const organizationIntegrationId = randomUUID();

    projectIntegrationRepository.projects.push({
      id: projectId,
      slug: "projeto-sem-website",
    });
    projectIntegrationRepository.integrationTypes.push({
      id: integrationTypeId,
      name: "Umami",
      slug: IntegrationType.UMAMI,
      logo: null,
    });
    projectIntegrationRepository.organizationIntegrations.push({
      id: organizationIntegrationId,
      organizationId,
    });

    await projectIntegrationRepository.create({
      projectId,
      integrationTypeId,
      organizationIntegrationId,
      enabled: true,
      config: {},
    });

    await expect(() =>
      sut.execute("projeto-sem-website", randomUUID()),
    ).rejects.toMatchObject({
      name: "ExternalServiceError",
    });
    expect(getCompleteAnalytics).not.toHaveBeenCalled();
    expect(umamiRepository.items).toHaveLength(0);
  });
});
