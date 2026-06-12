import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../../errors/IntegrationError";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { InMemorySonarQubeRepository } from "../../../repositories/in-memory/InMemorySonarQubeRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import type { IntegrationFactory } from "../../../services/IntegrationFactory";
import { SyncSonarQubeMetricsUseCase } from "./SyncSonarQubeMetricsUseCase";

vi.mock("../../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let sonarRepository: InMemorySonarQubeRepository;
let integrationFactory: IntegrationFactory;
let sut: SyncSonarQubeMetricsUseCase;

describe("SyncSonarQubeMetricsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();
    sonarRepository = new InMemorySonarQubeRepository();

    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue({
        getFullDashboardData: vi.fn().mockResolvedValue({
          metrics: {
            bugs: 1,
            vulnerabilities: 0,
            codeSmells: 2,
            coverage: 90,
            duplications: 0,
            technicalDebt: 30,
            status: "OK",
            securityRating: "A",
            severity: [],
          },
          qualityGate: [],
          issues: [],
        }),
      }),
    } as unknown as IntegrationFactory;

    sut = new SyncSonarQubeMetricsUseCase(
      projectIntegrationRepository,
      sonarRepository,
      integrationFactory,
    );
  });

  it("deve sincronizar métricas do SonarQube", async () => {
    const projectId = randomUUID();
    const organizationId = randomUUID();
    const integrationTypeId = randomUUID();
    const organizationIntegrationId = randomUUID();

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
      id: organizationIntegrationId,
      organizationId,
    });

    await projectIntegrationRepository.create({
      projectId,
      integrationTypeId,
      organizationIntegrationId,
      enabled: true,
    });

    const result = await sut.execute("projeto-alpha", randomUUID());

    expect(result.metrics.bugs).toBe(1);
    expect(sonarRepository.items).toHaveLength(1);
    expect(integrationFactory.getIntegration).toHaveBeenCalled();
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() =>
      sut.execute("inexistente", randomUUID()),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});
