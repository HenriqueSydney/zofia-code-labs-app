import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegrationError } from "../../../errors/IntegrationError";
import { InMemoryProjectIntegrationRepository } from "../../../repositories/in-memory/InMemoryProjectIntegrationRepository";
import { IntegrationType } from "../../../services/IntegrationFactory";
import type { IntegrationFactory } from "../../../services/IntegrationFactory";
import { GetSonarQubeIssueAndQualityGateUseCase } from "./GetSonarQubeIssueAndQualityGateUseCase";

let projectIntegrationRepository: InMemoryProjectIntegrationRepository;
let integrationFactory: IntegrationFactory;
let sut: GetSonarQubeIssueAndQualityGateUseCase;

describe("GetSonarQubeIssueAndQualityGateUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectIntegrationRepository = new InMemoryProjectIntegrationRepository();

    integrationFactory = {
      getIntegration: vi.fn().mockResolvedValue({
        getQualityGateStatus: vi.fn().mockResolvedValue([
          { metric: "coverage", value: 80, threshold: 70, status: "OK" },
        ]),
        getRecentIssues: vi.fn().mockResolvedValue([
          { key: "issue-1", severity: "MAJOR", message: "Fix me" },
        ]),
      }),
    } as unknown as IntegrationFactory;

    sut = new GetSonarQubeIssueAndQualityGateUseCase(
      projectIntegrationRepository,
      integrationFactory,
    );
  });

  it("deve retornar quality gate e issues recentes", async () => {
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

    expect(result.qualityGate).toHaveLength(1);
    expect(result.issues).toHaveLength(1);
    expect(integrationFactory.getIntegration).toHaveBeenCalled();
  });

  it("deve lançar IntegrationError quando integração não existe", async () => {
    await expect(() =>
      sut.execute("inexistente", randomUUID()),
    ).rejects.toBeInstanceOf(IntegrationError);
  });
});
